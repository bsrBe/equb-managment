import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { EqubMemberModule } from 'src/equb-member/equb-member.module';
import { Period } from 'src/equb/entities/period.entity';
import { AttendanceCronService } from './attendance-cron.service';
import { EqubMember } from 'src/equb-member/entities/equb-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Period, EqubMember]),
    EqubMemberModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCronService],
})
export class AttendanceModule {}
