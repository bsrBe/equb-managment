import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EqubService } from './equb.service';
import { CreateEqubDto } from './dto/create-equb.dto';
import { UpdateEqubDto } from './dto/update-equb.dto';

@Controller('equb')
export class EqubController {
  constructor(private readonly equbService: EqubService) {}

  @Post()
  create(@Body() createEqubDto: CreateEqubDto) {
    return this.equbService.create(createEqubDto);
  }

  @Get()
  findAll() {
    return this.equbService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equbService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEqubDto: UpdateEqubDto) {
    return this.equbService.update(+id, updateEqubDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equbService.remove(+id);
  }
}
