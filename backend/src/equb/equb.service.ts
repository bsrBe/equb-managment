import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const { totalRounds, payoutMultiplier, isInfinity, startDate, ...rest } = createEqubDto;
    
    const equb = this.equbRepo.create({
      ...rest,
      admin: { id: adminId },
      startDate: (startDate || null) as any,
      status: startDate ? 'ACTIVE' : 'PENDING',
      totalRounds: totalRounds || (createEqubDto.type === 'DAILY' ? 105 : createEqubDto.type === 'WEEKLY' ? 74 : 0),
      payoutMultiplier: payoutMultiplier || (createEqubDto.type === 'DAILY' ? 100 : 1),
      isInfinity: isInfinity ?? (createEqubDto.type === 'DAILY' ? true : false),
    }) as Equb;
    
    const saved = await this.equbRepo.save(equb);

    // Generate periods if startDate is provided
    if (saved.startDate) {
      const numberOfPeriods = saved.totalRounds || createEqubDto.expectedMemberCount || 0;
      if (numberOfPeriods > 0) {
        await this.generatePeriods(saved.id, saved.type, saved.startDate, numberOfPeriods);
      }
    }
    return this.findOne(saved.id, adminId);
  }

  /**
   * Start an Equb by setting start date and changing status to ACTIVE
   */
  async startEqub(id: string, startDate: Date, adminId: string) {
    const equb = await this.findOne(id, adminId);
    if (equb.status !== 'PENDING') {
      throw new BadRequestException('Equb is already started or completed');
    }

    equb.startDate = startDate;
    equb.status = 'ACTIVE';
    await this.equbRepo.save(equb);

    const numberOfPeriods = equb.totalRounds || equb.members?.length || 0;
    if (numberOfPeriods > 0) {
      await this.generatePeriods(equb.id, equb.type, equb.startDate, numberOfPeriods);
    }

    return this.findOne(id, adminId);
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
    // Clear existing periods first to avoid duplicates
    await this.periodRepo.delete({ equb: { id: equbId } });

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
    const existingPeriods = equb.periods || [];
    const periodCount = existingPeriods.length;

    if (memberCount > periodCount) {
      const additionalCount = memberCount - periodCount;
      const lastPeriod = existingPeriods.sort((a, b) => b.sequence - a.sequence)[0];
      
      const newPeriods: Partial<Period>[] = [];
      const startDate = lastPeriod ? new Date(lastPeriod.startDate) : new Date(equb.startDate);

      for (let i = 1; i <= additionalCount; i++) {
        const nextSequence = periodCount + i;
        const periodDate = new Date(startDate);
        
        // Offset from the last period's date
        if (equb.type === 'DAILY') periodDate.setDate(startDate.getDate() + i);
        if (equb.type === 'WEEKLY') periodDate.setDate(startDate.getDate() + i * 7);
        if (equb.type === 'MONTHLY') periodDate.setMonth(startDate.getMonth() + i);

        newPeriods.push({
          equbId,
          sequence: nextSequence,
          startDate: periodDate,
          endDate: periodDate,
          isCompleted: false,
        });
      }

      if (newPeriods.length > 0) {
        await this.periodRepo.save(newPeriods);
      }
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
      relations: ['members', 'members.user', 'members.attendances', 'periods', 'periods.payouts', 'periods.payouts.member.user'],
    });
    if (!equb) throw new NotFoundException('Equb not found');

    // Calculate contributionDays for members
    if (equb.members) {
      equb.members = equb.members.map(member => ({
        ...member,
        contributionDays: member.attendances?.filter(a => a.status === 'PAID').length || 0,
      })) as any;
    }

    return equb;
  }

  async update(id: string, updateEqubDto: UpdateEqubDto, adminId: string) {
    const equb = await this.findOne(id, adminId);
    const oldTotalRounds = equb.totalRounds;
    
    Object.assign(equb, updateEqubDto);
    await this.equbRepo.save(equb);

    // If totalRounds has increased, generate the new periods
    if (updateEqubDto.totalRounds && updateEqubDto.totalRounds > oldTotalRounds) {
      const additionalCount = updateEqubDto.totalRounds - oldTotalRounds;
      const lastPeriod = equb.periods?.sort((a, b) => b.sequence - a.sequence)[0];
      const startSequence = (lastPeriod?.sequence || 0) + 1;
      const baseDate = lastPeriod ? new Date(lastPeriod.startDate) : new Date(equb.startDate);
      
      // We need a version of generatePeriods that appends instead of clearing
      await this.appendPeriods(equb.id, equb.type, baseDate, additionalCount, startSequence);
    }

    return this.findOne(id, adminId);
  }

  /**
   * Append additional periods to an existing Equb
   */
  private async appendPeriods(
    equbId: string,
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    lastPeriodDate: Date,
    count: number,
    startSequence: number
  ) {
    const periods: Partial<Period>[] = [];
    const baseDate = new Date(lastPeriodDate);
    
    for (let i = 0; i < count; i++) {
        const sequence = startSequence + i;
        const periodDate = new Date(baseDate);
        
        // Offset from the last record
        const offset = i + 1;
        if (type === 'DAILY') periodDate.setDate(baseDate.getDate() + offset);
        if (type === 'WEEKLY') periodDate.setDate(baseDate.getDate() + offset * 7);
        if (type === 'MONTHLY') periodDate.setMonth(baseDate.getMonth() + offset);

        periods.push({
            equbId,
            sequence,
            startDate: periodDate,
            endDate: periodDate,
            isCompleted: false,
        });
    }
    await this.periodRepo.save(periods);
  }

  async remove(id: string, adminId: string) {
    const equb = await this.findOne(id, adminId);
    return await this.equbRepo.remove(equb);
  }
}
