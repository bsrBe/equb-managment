import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AdminService } from './admin/admin.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './datasource/datasource';
import { UserModule } from './user/user.module';
import { EqubModule } from './equb/equb.module';
import { EqubMemberModule } from './equb-member/equb-member.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayoutModule } from './payout/payout.module';
import { AuthModule } from './auth/auth.module';
import { ReportingModule } from './reporting/reporting.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
   imports : [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      ScheduleModule.forRoot(),
      TypeOrmModule.forRoot(dataSourceOptions),
       AdminModule,
       UserModule,
       EqubModule,
       EqubMemberModule,
       AttendanceModule,
       PayoutModule,
       AuthModule,
       ReportingModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
