import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { EqubMemberModule } from 'src/equb-member/equb-member.module';
import { Period } from 'src/equb/entities/period.entity';
import { AttendanceCronService } from './attendance-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Period]),
    EqubMemberModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCronService],
})
export class AttendanceModule {}
