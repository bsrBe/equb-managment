import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from 'src/payout/entities/payout.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { EqubMember } from 'src/equb-member/entities/equb-member.entity';
import { Equb } from 'src/equb/entities/equb.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Payout) private payoutRepo: Repository<Payout>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(EqubMember) private memberRepo: Repository<EqubMember>,
    @InjectRepository(Equb) private equbRepo: Repository<Equb>,
  ) {}

  async getDashboardStats(adminId: string) {
    const [totalEqubs, totalMembers] = await Promise.all([
      this.equbRepo.count({ where: { admin: { id: adminId } } }),
      this.memberRepo.count({ where: { equb: { admin: { id: adminId } } } }),
    ]);

    const payoutVolume = await this.payoutRepo
      .createQueryBuilder('payout')
      .leftJoin('payout.equb', 'equb')
      .leftJoin('equb.admin', 'admin')
      .where('admin.id = :adminId', { adminId })
      .select('SUM(payout.amount)', 'total')
      .getRawOne();

    const attendanceStats = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.equbMember', 'member')
      .leftJoin('member.equb', 'equb')
      .leftJoin('equb.admin', 'admin')
      .where('admin.id = :adminId', { adminId })
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    return {
      totalEqubs,
      totalMembers,
      totalPayoutVolume: Number(payoutVolume?.total || 0),
      attendance: attendanceStats.reduce((acc, curr) => {
        acc[curr.status.toLowerCase()] = Number(curr.count);
        return acc;
      }, { paid: 0, missed: 0 }),
    };
  }

  async getEqubStats(equbId: string, adminId: string) {
    const equb = await this.equbRepo.findOne({
      where: { id: equbId, admin: { id: adminId } },
      relations: ['members'],
    });

    if (!equb) throw new NotFoundException('Equb not found');

    const totalActiveMembers = equb.members.filter(m => m.isActive).length;
    const membersPaidInRound = equb.members.filter(m => m.isActive && m.hasReceivedPayout).length;

    const collectionRate = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.equbMember', 'member')
      .where('member.equbId = :equbId', { equbId })
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    const stats = collectionRate.reduce((acc, curr) => {
        acc[curr.status.toLowerCase()] = Number(curr.count);
        return acc;
      }, { paid: 0, missed: 0 });

    // Calculate total collected from PAID attendances
    const paidAttendances = await this.attendanceRepo.find({
      where: { equbMember: { equb: { id: equbId } }, status: 'PAID' },
      relations: ['equbMember'],
    });

    const totalCollected = paidAttendances.reduce((sum, att) => {
      const base = Number(equb.defaultContributionAmount);
      let multiplier = 1;
      if (att.equbMember.contributionType === 'HALF') multiplier = 0.5;
      if (att.equbMember.contributionType === 'QUARTER') multiplier = 0.25;
      return sum + (base * multiplier);
    }, 0);

    return {
      equbName: equb.name,
      currentRound: equb.currentRound,
      totalRounds: totalActiveMembers,
      progress: Math.round((membersPaidInRound / totalActiveMembers) * 100) || 0,
      attendance: stats,
      totalCollected: totalCollected,
    };
  }

  async getMemberStats(memberId: string, adminId: string) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, equb: { admin: { id: adminId } } },
      relations: ['equb', 'user'],
    });

    if (!member) throw new NotFoundException('Member not found');

    const [attendance, totalSaved] = await Promise.all([
      this.attendanceRepo.find({ where: { equbMember: { id: memberId } } }),
      this.payoutRepo.sum('amount', { memberId }),
    ]);

    const paidCount = attendance.filter(a => a.status === 'PAID').length;
    const totalCount = attendance.length;

    return {
      userName: member.user.name,
      equbName: member.equb.name,
      consistencyScore: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 100,
      totalSaved: Number(totalSaved || 0),
      attendanceHistory: {
        paid: paidCount,
        missed: totalCount - paidCount,
        total: totalCount
      },
    };
  }
}
