import { Module } from '@nestjs/common';
import { EqubMemberService } from './equb-member.service';
import { EqubMemberController } from './equb-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EqubMember } from './entities/equb-member.entity';
import { Equb } from 'src/equb/entities/equb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EqubMember, Equb])],
  controllers: [EqubMemberController],
  providers: [EqubMemberService],
  exports: [EqubMemberService],
})
export class EqubMemberModule {}
