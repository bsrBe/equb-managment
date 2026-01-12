import { Module } from '@nestjs/common';
import { EqubMemberService } from './equb-member.service';
import { EqubMemberController } from './equb-member.controller';

@Module({
  controllers: [EqubMemberController],
  providers: [EqubMemberService],
})
export class EqubMemberModule {}
