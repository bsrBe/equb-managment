import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { EqubMemberService } from 'src/equb-member/equb-member.service';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    private readonly equbMemberService: EqubMemberService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto, adminId: string) {
    const member = await this.equbMemberService.findOne(createAttendanceDto.equbMemberId, adminId);
    if (!member) throw new NotFoundException('Equb Member not found or access denied');

    // Check for existing attendance for this member and period
    const existing = await this.attendanceRepo.findOne({
      where: {
        equbMember: { id: createAttendanceDto.equbMemberId },
        period: { id: createAttendanceDto.periodId },
      },
    });

    if (existing) {
      existing.status = createAttendanceDto.status;
      existing.recordedBy = { id: adminId } as any;
      const saved = await this.attendanceRepo.save(existing);
      return this.findOne(saved.id);
    }

    const attendance = this.attendanceRepo.create({
      ...createAttendanceDto,
      equbMember: { id: createAttendanceDto.equbMemberId },
      period: { id: createAttendanceDto.periodId },
      recordedBy: { id: adminId },
    });

    const saved = await this.attendanceRepo.save(attendance);
    return this.findOne(saved.id);
  }

  async findAll(
    adminId: string,
    filter: AttendanceFilterDto,
  ): Promise<PaginatedResponse<Attendance>> {
    const query = this.attendanceRepo.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.equbMember', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.equb', 'equb')
      .leftJoinAndSelect('attendance.period', 'period')
      .leftJoinAndSelect('attendance.recordedBy', 'recordedBy')
      .where('equb.adminId = :adminId', { adminId });

    if (filter.equbMemberId) {
      query.andWhere('member.id = :memberId', { memberId: filter.equbMemberId });
    }

    if (filter.equbId) {
      query.andWhere('equb.id = :equbId', { equbId: filter.equbId });
    }

    if (filter.periodId) {
      query.andWhere('period.id = :periodId', { periodId: filter.periodId });
    }

    if (filter.status) {
      query.andWhere('attendance.status = :status', { status: filter.status });
    }

    if (filter.searchTerm) {
      query.andWhere('(user.name ILIKE :search OR user.phone ILIKE :search)', { search: `%${filter.searchTerm}%` });
    }

    if (filter.startDate) {
      query.andWhere('period.startDate >= :startDate', { startDate: filter.startDate });
    }

    if (filter.endDate) {
      query.andWhere('period.endDate <= :endDate', { endDate: filter.endDate });
    }

    const [data, totalItems] = await query
      .skip(filter.skip)
      .take(filter.limit)
      .orderBy('attendance.recordedAt', 'DESC')
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

  async findOne(id: string) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: ['equbMember', 'period', 'recordedBy'],
    });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto, adminId?: string) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (updateAttendanceDto.equbMemberId && adminId) {
      await this.equbMemberService.findOne(updateAttendanceDto.equbMemberId, adminId);
    }

    await this.attendanceRepo.update(id, {
      ...updateAttendanceDto,
      equbMember: updateAttendanceDto.equbMemberId ? { id: updateAttendanceDto.equbMemberId } : undefined,
      recordedBy: adminId ? { id: adminId } : (updateAttendanceDto.recordedBy ? { id: updateAttendanceDto.recordedBy } : undefined),
    });

    return this.findOne(id);
  }

  remove(id: string) {
    return this.attendanceRepo.delete(id);
  }
}
