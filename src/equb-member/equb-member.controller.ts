import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EqubMemberService } from './equb-member.service';
import { CreateEqubMemberDto } from './dto/create-equb-member.dto';
import { UpdateEqubMemberDto } from './dto/update-equb-member.dto';
import { AuthGuard } from '@nestjs/passport';
import { currentAdmin } from 'src/auth/decorators/current-admin.decorator';
import { Admin } from 'src/admin/entities/admin.entity';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { MemberFilterDto } from './dto/member-filter.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('equb-member')
export class EqubMemberController {
  constructor(private readonly equbMemberService: EqubMemberService) {}

  @Post()
  create(@Body() createEqubMemberDto: CreateEqubMemberDto, @currentAdmin() admin: Admin) {
    return this.equbMemberService.create(createEqubMemberDto, admin.id);
  }

  @Get()
  findAll(
    @currentAdmin() admin: Admin,
    @Query() filter: MemberFilterDto,
  ) {
    if (filter.equbId) {
      return this.equbMemberService.findByEqub(filter.equbId, admin.id, filter);
    }
    return this.equbMemberService.findAll(admin.id, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @currentAdmin() admin: Admin) {
    return this.equbMemberService.findOne(id, admin.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEqubMemberDto: UpdateEqubMemberDto, @currentAdmin() admin: Admin) {
    return this.equbMemberService.update(id, updateEqubMemberDto, admin.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @currentAdmin() admin: Admin) {
    return this.equbMemberService.remove(id, admin.id);
  }
}
