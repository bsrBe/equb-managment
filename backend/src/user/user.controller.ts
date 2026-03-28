import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { PaginationParamsDto } from '../common/dto/pagination.dto';

import { UserFilterDto } from './dto/user-filter.dto';
import { EqubMemberService } from '../equb-member/equb-member.service';
import { currentAdmin } from '../auth/decorators/current-admin.decorator';
import { Admin } from '../admin/entities/admin.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly equbMemberService: EqubMemberService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() filter: UserFilterDto) {
    return this.userService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  
  @Get(':id/memberships')
  async getMemberships(
    @Param('id') id: string,
    @currentAdmin() admin: Admin,
    @Query('limit') limit?: number,
  ) {
    const response = await this.equbMemberService.findAll(admin.id, {
      userId: id,
      limit: limit || 1000,
      page: 1,
      skip: 0
    });
    return response.data;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
