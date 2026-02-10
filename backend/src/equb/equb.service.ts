import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEqubDto } from './dto/create-equb.dto';
import { UpdateEqubDto } from './dto/update-equb.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equb } from './entities/equb.entity';
import { Repository, ILike, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { EqubFilterDto } from './dto/equb-filter.dto';
import { Period } from './entities/period.entity';
import { AdminResponseDto } from 'src/admin/dto/AdminLogin.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class EqubService {
  constructor(
    @InjectRepository(Equb)
    private readonly equbRepo: Repository<Equb>,
    @InjectRepository(Period)
    private readonly periodRepo: Repository<Period>,
  ) {}

  async create(createEqubDto: CreateEqubDto, adminId: string) {
    const equb = this.equbRepo.create({
      ...createEqubDto,
      admin: { id: adminId },
    });
    const saved = await this.equbRepo.save(equb);

    // Generate periods based on expectedMemberCount (default to 0 if not provided)
    const numberOfPeriods = createEqubDto.expectedMemberCount || 0;
    if (numberOfPeriods > 0) {
      await this.generatePeriods(saved.id, saved.type, saved.startDate, numberOfPeriods);
    }
    return this.findOne(saved.id, adminId);
  }

  /**
   * Generate periods for an Equb
   */
  private async generatePeriods(
    equbId: string,
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    startDate: Date,
    count: number
  ) {
    const periods: Partial<Period>[] = [];
    const baseDate = new Date(startDate);
    for (let i = 1; i <= count; i++) {
      const periodDate = new Date(baseDate);
      if (type === 'DAILY') periodDate.setDate(baseDate.getDate() + (i - 1));
      if (type === 'WEEKLY') periodDate.setDate(baseDate.getDate() + (i - 1) * 7);
      if (type === 'MONTHLY') periodDate.setMonth(baseDate.getMonth() + (i - 1));

      periods.push({
        equbId,
        sequence: i,
        startDate: periodDate,
        endDate: periodDate,
        isCompleted: false,
      });
    }
    await this.periodRepo.save(periods);
  }

  /**
   * Ensure periods match member count
   * Creates additional periods if members > periods
   */
  async ensurePeriodsMatchMembers(equbId: string, adminId: string): Promise<void> {
    const equb = await this.findOne(equbId, adminId);
    const memberCount = equb.members?.length || 0;
    const periodCount = equb.periods?.length || 0;

    if (memberCount > periodCount) {
      // Need to create more periods
      const additionalPeriods = memberCount - periodCount;
      await this.generatePeriods(
        equb.id,
        equb.type,
        equb.startDate,
        memberCount // Total count, generatePeriods will handle sequence numbers
      );

      // Delete old periods and regenerate to avoid sequence conflicts
      await this.periodRepo.delete({ equbId: equb.id });
      await this.generatePeriods(equb.id, equb.type, equb.startDate, memberCount);
    }
  }

  async findAll(adminId: string, filter: EqubFilterDto): Promise<PaginatedResponse<Equb>> {
    const query = this.equbRepo.createQueryBuilder('equb')
      .where('equb.adminId = :adminId', { adminId });

    if (filter.searchTerm || filter.name) {
      const name = filter.searchTerm || filter.name;
      query.andWhere('equb.name ILIKE :name', { name: `%${name}%` });
    }

    if (filter.type) {
      query.andWhere('equb.type = :type', { type: filter.type });
    }

    if (filter.status) {
      query.andWhere('equb.status = :status', { status: filter.status });
    }

    if (filter.minContribution) {
      query.andWhere('equb.defaultContributionAmount >= :min', { min: filter.minContribution });
    }

    if (filter.maxContribution) {
      query.andWhere('equb.defaultContributionAmount <= :max', { max: filter.maxContribution });
    }

    const [data, totalItems] = await query
      .leftJoinAndSelect('equb.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('equb.periods', 'periods')
      .skip(filter.skip)
      .take(filter.limit)
      .orderBy('equb.createdAt', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / filter.limit);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: filter.limit,
        totalPages,
        currentPage: filter.page,
      },
    };
  }

  async findOne(id: string, adminId: string) {
    const equb = await this.equbRepo.findOne({
      where: { id, admin: { id: adminId } },
      relations: ['members', 'members.user', 'periods', 'periods.payouts', 'periods.payouts.member.user'],
    });
    if (!equb) throw new NotFoundException('Equb not found');

    // Lazy generate periods if they don't exist AND there are members
    if ((!equb.periods || equb.periods.length === 0) && equb.members && equb.members.length > 0) {
      await this.generatePeriods(equb.id, equb.type, equb.startDate, equb.members.length);
      // Re-fetch to get periods
      return this.findOne(id, adminId);
    }

    return equb;
  }

  async update(id: string, updateEqubDto: UpdateEqubDto, adminId: string) {
    const equb = await this.findOne(id, adminId);
    Object.assign(equb, updateEqubDto);
    await this.equbRepo.save(equb);
    return this.findOne(id, adminId);
  }

  async remove(id: string, adminId: string) {
    const equb = await this.findOne(id, adminId);
    return await this.equbRepo.remove(equb);
  }
}
