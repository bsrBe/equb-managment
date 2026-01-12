import { Injectable } from '@nestjs/common';
import { CreateEqubDto } from './dto/create-equb.dto';
import { UpdateEqubDto } from './dto/update-equb.dto';

@Injectable()
export class EqubService {
  create(createEqubDto: CreateEqubDto) {
    return 'This action adds a new equb';
  }

  findAll() {
    return `This action returns all equb`;
  }

  findOne(id: number) {
    return `This action returns a #${id} equb`;
  }

  update(id: number, updateEqubDto: UpdateEqubDto) {
    return `This action updates a #${id} equb`;
  }

  remove(id: number) {
    return `This action removes a #${id} equb`;
  }
}
