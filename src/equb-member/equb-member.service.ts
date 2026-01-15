import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateEqubMemberDto } from './dto/create-equb-member.dto';
import { UpdateEqubMemberDto } from './dto/update-equb-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EqubMember } from './entities/equb-member.entity';
import { Repository } from 'typeorm';
import { Equb } from 'src/equb/entities/equb.entity';
import { MemberFilterDto } from './dto/member-filter.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class EqubMemberService {
  constructor(
    @InjectRepository(EqubMember)
    private readonly equbMemberRepo: Repository<EqubMember>,
    @InjectRepository(Equb)
    private readonly equbRepo: Repository<Equb>,
  ) {}

  async create(createEqubMemberDto: CreateEqubMemberDto, adminId: string) {
    // Verify Equb ownership
    const equb = await this.equbRepo.findOne({
      where: { id: createEqubMemberDto.equbId, admin: { id: adminId } },
    });
    if (!equb) throw new NotFoundException('Equb not found or access denied');

    const member = this.equbMemberRepo.create({
      ...createEqubMemberDto,
      equb: { id: createEqubMemberDto.equbId },
      user: { id: createEqubMemberDto.userId },
    });
    const saved = await this.equbMemberRepo.save(member);
    return this.findOne(saved.id, adminId);
  }

  async findAll(adminId: string, filter: MemberFilterDto): Promise<PaginatedResponse<EqubMember>> {
    const query = this.equbMemberRepo.createQueryBuilder('member')
      .leftJoinAndSelect('member.equb', 'equb')
      .leftJoinAndSelect('member.user', 'user')
      .where('equb.adminId = :adminId', { adminId });

    if (filter.searchTerm || filter.name) {
      const name = filter.searchTerm || filter.name;
      query.andWhere('user.fullName ILIKE :name', { name: `%${name}%` });
    }

    if (filter.phone) {
      query.andWhere('user.phoneNumber ILIKE :phone', { phone: `%${filter.phone}%` });
    }

    if (filter.equbId) {
      query.andWhere('equb.id = :equbId', { equbId: filter.equbId });
    }

    if (filter.isActive !== undefined) {
      query.andWhere('member.isActive = :isActive', { isActive: filter.isActive });
    }

    if (filter.hasReceivedPayout !== undefined) {
      query.andWhere('member.hasReceivedPayout = :hasReceivedPayout', { hasReceivedPayout: filter.hasReceivedPayout });
    }

    if (filter.contributionType) {
      query.andWhere('member.contributionType = :contributionType', { contributionType: filter.contributionType });
    }

    const [data, totalItems] = await query
      .skip(filter.skip)
      .take(filter.limit)
      .orderBy('member.createdAt', 'DESC')
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
    const member = await this.equbMemberRepo.findOne({
      where: { id, equb: { admin: { id: adminId } } },
      relations: ['equb', 'user'],
    });
    if (!member) throw new NotFoundException('Equb Member not found');
    return member;
  }

  async update(id: string, updateEqubMemberDto: UpdateEqubMemberDto, adminId: string) {
    const member = await this.findOne(id, adminId);
    Object.assign(member, updateEqubMemberDto);
    await this.equbMemberRepo.save(member);
    return this.findOne(id, adminId);
  }

  async remove(id: string, adminId: string) {
    const member = await this.findOne(id, adminId);
    return await this.equbMemberRepo.remove(member);
  }

  async findByEqub(equbId: string, adminId: string, pagination: PaginationParamsDto): Promise<PaginatedResponse<EqubMember>> {
    // We can reuse the filter logic if we want, but for now let's just add equbId to filter.
    return this.findAll(adminId, { ...pagination, equbId } as MemberFilterDto);
  }

  async getEligibleWinners(equbId: string, adminId: string) {
    return await this.equbMemberRepo.find({
      where: { 
        equb: { id: equbId, admin: { id: adminId } }, 
        hasReceivedPayout: false, 
        isActive: true 
      },
    });
  }

  async resetPayouts(equbId: string, adminId: string) {
    // Verify ownership and check if members exist
    const count = await this.equbMemberRepo.count({
      where: { equb: { id: equbId, admin: { id: adminId } } }
    });
    
    if (count === 0) return;
    
    await this.equbMemberRepo.update(
      { equb: { id: equbId } },
      { hasReceivedPayout: false }
    );
  }
}
