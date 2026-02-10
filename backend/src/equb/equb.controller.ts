import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EqubService } from './equb.service';
import { CreateEqubDto } from './dto/create-equb.dto';
import { UpdateEqubDto } from './dto/update-equb.dto';
import { AuthGuard } from '@nestjs/passport';
import { currentAdmin } from 'src/auth/decorators/current-admin.decorator';
import { Admin } from 'src/admin/entities/admin.entity';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

import { EqubFilterDto } from './dto/equb-filter.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('equb')
export class EqubController {
  constructor(private readonly equbService: EqubService) {}

  @Post()
  create(@Body() createEqubDto: CreateEqubDto, @currentAdmin() admin: Admin) {
    return this.equbService.create(createEqubDto, admin.id);
  }

  @Get()
  findAll(@currentAdmin() admin: Admin, @Query() filter: EqubFilterDto) {
    return this.equbService.findAll(admin.id, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @currentAdmin() admin: Admin) {
    return this.equbService.findOne(id, admin.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEqubDto: UpdateEqubDto, @currentAdmin() admin: Admin) {
    return this.equbService.update(id, updateEqubDto, admin.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @currentAdmin() admin: Admin) {
    return this.equbService.remove(id, admin.id);
  }
}
