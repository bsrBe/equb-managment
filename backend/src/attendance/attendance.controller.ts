import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthGuard } from '@nestjs/passport';
import { currentAdmin } from 'src/auth/decorators/current-admin.decorator';
import { Admin } from 'src/admin/entities/admin.entity';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto, @currentAdmin() admin: Admin) {
    return this.attendanceService.create(createAttendanceDto, admin.id);
  }

  @Get()
  findAll(
    @currentAdmin() admin: Admin,
    @Query() filter: AttendanceFilterDto,
  ) {
    return this.attendanceService.findAll(admin.id, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto, @currentAdmin() admin: Admin) {
    return this.attendanceService.update(id, updateAttendanceDto, admin.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }
}
