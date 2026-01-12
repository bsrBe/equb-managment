import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EqubMemberService } from './equb-member.service';
import { CreateEqubMemberDto } from './dto/create-equb-member.dto';
import { UpdateEqubMemberDto } from './dto/update-equb-member.dto';

@Controller('equb-member')
export class EqubMemberController {
  constructor(private readonly equbMemberService: EqubMemberService) {}

  @Post()
  create(@Body() createEqubMemberDto: CreateEqubMemberDto) {
    return this.equbMemberService.create(createEqubMemberDto);
  }

  @Get()
  findAll() {
    return this.equbMemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equbMemberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEqubMemberDto: UpdateEqubMemberDto) {
    return this.equbMemberService.update(+id, updateEqubMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equbMemberService.remove(+id);
  }
}
