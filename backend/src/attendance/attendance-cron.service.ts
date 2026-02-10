import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Period } from '../equb/entities/period.entity';
import { Attendance } from './entities/attendance.entity';
import { EqubMember } from 'src/equb-member/entities/equb-member.entity';
import { Repository, LessThan } from 'typeorm';

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(
    @InjectRepository(Period)
    private readonly periodRepo: Repository<Period>,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(EqubMember)
    private readonly memberRepo: Repository<EqubMember>,
  ) {}

  /**
   * Runs every day at midnight to check for ended periods and mark MISSED attendance.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Starting Automatic Attendance Cron Job...');

    // 1. Find all periods that ended BEFORE today and are not yet completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastPeriods = await this.periodRepo.find({
      where: {
        endDate: LessThan(today),
        isCompleted: false,
      },
      relations: ['equb'],
    });

    if (pastPeriods.length === 0) {
      this.logger.log('No pending periods to process.');
      return;
    }

    this.logger.log(`Found ${pastPeriods.length} periods to process.`);

    for (const period of pastPeriods) {
      try {
        await this.processPeriod(period);
      } catch (error) {
        this.logger.error(`Error processing period ${period.id}: ${error.message}`);
      }
    }

    this.logger.log('Automatic Attendance Cron Job finished.');
  }

  private async processPeriod(period: Period) {
    this.logger.log(`Processing Equb: ${period.equb.name} | Period Sequence: ${period.sequence}`);

    // 1. Get all active members for this Equb
    const activeMembers = await this.memberRepo.find({
      where: {
        equb: { id: period.equbId },
        isActive: true,
      },
    });

    for (const member of activeMembers) {
      // 2. Check if attendance already exists (PAID or MISSED)
      const existingAttendance = await this.attendanceRepo.findOne({
        where: {
          equbMember: { id: member.id },
          period: { id: period.id },
        },
      });

      if (!existingAttendance) {
        // 3. Mark as MISSED
        const attendance = this.attendanceRepo.create({
          equbMember: { id: member.id },
          period: { id: period.id },
          status: 'MISSED',
          note: 'Auto-marked by system',
        });
        await this.attendanceRepo.save(attendance);
        this.logger.debug(`Marked member ${member.id} as MISSED for period ${period.id}`);
      }
    }

    // 4. Mark period as completed so we don't process it tomorrow
    period.isCompleted = true;
    await this.periodRepo.save(period);
    this.logger.log(`Period ${period.id} marked as completed.`);
  }
}
