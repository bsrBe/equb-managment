import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { AuthGuard } from '@nestjs/passport';
import { currentAdmin } from 'src/auth/decorators/current-admin.decorator';
import { Admin } from 'src/admin/entities/admin.entity';

@Controller('reporting')
@UseGuards(AuthGuard('jwt'))
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('dashboard')
  getDashboard(@currentAdmin() admin: Admin) {
    return this.reportingService.getDashboardStats(admin.id);
  }

  @Get('equb/:id')
  getEqubStats(@Param('id') id: string, @currentAdmin() admin: Admin) {
    return this.reportingService.getEqubStats(id, admin.id);
  }

  @Get('member/:id')
  getMemberStats(@Param('id') id: string, @currentAdmin() admin: Admin) {
    return this.reportingService.getMemberStats(id, admin.id);
  }

  @Get('transactions')
  getTransactions(@currentAdmin() admin: Admin) {
    return this.reportingService.getTransactions(admin.id);
  }
}
