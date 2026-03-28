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
    const adminEqubs = await this.equbRepo.find({
      where: { adminId },
      relations: ['members', 'periods', 'periods.attendances', 'periods.attendances.equbMember'],
    });
    
    // Filter to only include the current period for each equb in memory
    // and only active equbs for calculations
    const activeEqubsList = adminEqubs.filter(e => e.status === 'ACTIVE');
    const activeEqubsCount = activeEqubsList.length;

    const totalMembers = await this.memberRepo.count({ 
      where: { equb: { adminId: adminId } } 
    });

    let totalExpected = 0;
    let totalCollected = 0;

    activeEqubsList.forEach(e => {
        const base = Number(e.defaultContributionAmount);
        // Find the period matching currentRound
        const currentPeriod = e.periods?.find(p => p.sequence === e.currentRound);
        
        e.members?.forEach(m => {
            let memberGoal = 0;
            if (m.contributionType === 'CUSTOM') {
                memberGoal = Number(m.customContributionAmount || 0);
            } else {
                let multiplier = 1;
                if (m.contributionType === 'HALF') multiplier = 0.5;
                if (m.contributionType === 'QUARTER') multiplier = 0.25;
                memberGoal = base * multiplier;
            }
            
            totalExpected += memberGoal;

            if (currentPeriod) {
                const paidAttendance = (currentPeriod.attendances || []).find(
                    a => a.equbMember?.id === m.id && a.status === 'PAID'
                );
                if (paidAttendance) {
                    totalCollected += memberGoal;
                }
            }
        });
    });

    return {
      totalExpected,
      totalCollected,
      activeEqubs: activeEqubsCount,
      totalMembers,
    };
  }

  async getEqubStats(equbId: string, adminId: string) {
    const equb = await this.equbRepo.findOne({
      where: { id: equbId, admin: { id: adminId } },
      relations: ['members', 'periods'],
    });

    if (!equb) throw new NotFoundException('Equb not found');

    const totalMembers = equb.members.length;
    const totalPeriods = equb.periods?.length || totalMembers;
    
    // totalContributions: sum of all PAID attendances for this equb
    const paidAttendances = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .innerJoinAndSelect('attendance.equbMember', 'member')
      .where('member.equbId = :equbId', { equbId })
      .andWhere('attendance.status = :status', { status: 'PAID' })
      .getMany();

    const totalContributions = paidAttendances.reduce((sum, att) => {
      const member = att.equbMember;
      if (member.contributionType === 'CUSTOM') {
        return sum + Number(member.customContributionAmount || 0);
      }
      
      const base = Number(equb.defaultContributionAmount);
      let multiplier = 1;
      if (member.contributionType === 'HALF') multiplier = 0.5;
      if (member.contributionType === 'QUARTER') multiplier = 0.25;
      
      return sum + (base * multiplier);
    }, 0);

    // totalPayouts: sum of all payouts for this equb
    const totalPayoutsSum = await this.payoutRepo.sum('amount', { equbId });

    // averageAttendance
    const attendanceStats = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.equbMember', 'member')
      .where('member.equbId = :equbId', { equbId })
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    const counts = attendanceStats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = Number(curr.count);
      return acc;
    }, { paid: 0, missed: 0 });

    const totalAttendanceRecords = counts.paid + counts.missed;
    const averageAttendance = totalAttendanceRecords > 0 
      ? (counts.paid / totalAttendanceRecords) * 100 
      : 100;

    const settledRounds = equb.status === 'COMPLETED' ? totalPeriods : Math.max(0, equb.currentRound - 1);
    
    // Calculate how many periods have at least one attendance record
    const recordedPeriodsCount = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .innerJoin('attendance.equbMember', 'member')
      .where('member.equbId = :equbId', { equbId })
      .select('COUNT(DISTINCT attendance.periodId)', 'count')
      .getRawOne();

    const completionPercentage = Math.round((settledRounds / totalPeriods) * 100);

    return {
      totalContributions,
      totalPayouts: Number(totalPayoutsSum || 0),
      completionPercentage,
      averageAttendance: Math.round(averageAttendance),
      totalMembers,
      activePeriods: totalPeriods,
      recordedPeriodsCount: Number(recordedPeriodsCount?.count || 0),
      equbType: equb.type,
    };
  }

  async getMemberStats(memberId: string, adminId: string) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId, equb: { admin: { id: adminId } } },
      relations: ['equb', 'user', 'attendances'],
    });

    if (!member) throw new NotFoundException('Member not found');

    const paidAttendances = member.attendances.filter(a => a.status === 'PAID');
    const totalCount = member.attendances.length;
    
    const base = Number(member.equb.defaultContributionAmount);
    let multiplier = 1;
    if (member.contributionType === 'HALF') multiplier = 0.5;
    if (member.contributionType === 'QUARTER') multiplier = 0.25;
    
    const totalContributions = paidAttendances.length * (base * multiplier);

    const totalEqubsCount = await this.memberRepo.count({
      where: { user: { id: member.user.id } }
    });

    return {
      totalContributions,
      missedPayments: totalCount - paidAttendances.length,
      attendanceRate: totalCount > 0 ? Math.round((paidAttendances.length / totalCount) * 100) : 100,
      totalEqubs: totalEqubsCount,
      hasReceivedPayout: member.hasReceivedPayout,
    };
  }

  async getTransactions(adminId: string) {
    // 1. Get all PAID attendance records (Collections)
    const collections = await this.attendanceRepo.find({
      where: { equbMember: { equb: { admin: { id: adminId } } }, status: 'PAID' },
      relations: ['equbMember', 'equbMember.equb', 'equbMember.user'],
      order: { recordedAt: 'DESC' },
      take: 50, // Limit to recent 50
    });

    // 2. Get all Payouts
    const payouts = await this.payoutRepo.find({
      where: { equb: { admin: { id: adminId } } },
      relations: ['equb', 'member', 'member.user'],
      order: { payoutDate: 'DESC' },
      take: 50, // Limit to recent 50
    });

    // 3. Map to uniform Transaction format
    const transactions = [
      ...collections.map(c => {
        let multiplier = 1;
        if (c.equbMember.contributionType === 'HALF') multiplier = 0.5;
        if (c.equbMember.contributionType === 'QUARTER') multiplier = 0.25;
        const amount = Number(c.equbMember.equb.defaultContributionAmount) * multiplier;

        return {
          id: c.id,
          type: 'COLLECTION' as const,
          amount,
          date: c.recordedAt,
          equbName: c.equbMember.equb.name,
          memberName: c.equbMember.user.name,
          paymentMethod: 'CASH', // Default for now as it's not in entity
          status: 'COMPLETED'
        };
      }),
      ...payouts.map(p => ({
        id: p.id,
        type: 'PAYOUT' as const,
        amount: Number(p.amount),
        date: p.payoutDate,
        equbName: p.equb.name,
        memberName: p.member.user.name,
        paymentMethod: 'TRANSFER',
        status: 'COMPLETED'
      }))
    ];

    // 4. Sort combined list by date descending
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
