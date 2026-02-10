import { PartialType } from '@nestjs/mapped-types';
import { CreateEqubMemberDto } from './create-equb-member.dto';

export class UpdateEqubMemberDto extends PartialType(CreateEqubMemberDto) {}
