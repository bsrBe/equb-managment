import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { EqubMemberModule } from 'src/equb-member/equb-member.module';
import { EqubModule } from 'src/equb/equb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payout]),
    EqubModule,
    EqubMemberModule,
  ],
  controllers: [PayoutController],
  providers: [PayoutService],
})
export class PayoutModule {}
