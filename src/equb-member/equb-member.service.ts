import { Injectable } from '@nestjs/common';
import { CreateEqubMemberDto } from './dto/create-equb-member.dto';
import { UpdateEqubMemberDto } from './dto/update-equb-member.dto';

@Injectable()
export class EqubMemberService {
  create(createEqubMemberDto: CreateEqubMemberDto) {
    return 'This action adds a new equbMember';
  }

  findAll() {
    return `This action returns all equbMember`;
  }

  findOne(id: number) {
    return `This action returns a #${id} equbMember`;
  }

  update(id: number, updateEqubMemberDto: UpdateEqubMemberDto) {
    return `This action updates a #${id} equbMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} equbMember`;
  }
}
