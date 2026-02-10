import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from 'src/payout/entities/payout.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { EqubMember } from 'src/equb-member/entities/equb-member.entity';
import { Equb } from 'src/equb/entities/equb.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payout, Attendance, EqubMember, Equb]),
  ],
  providers: [ReportingService],
  controllers: [ReportingController]
})
export class ReportingModule {}
