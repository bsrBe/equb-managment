import { Module } from '@nestjs/common';
import { EqubService } from './equb.service';
import { EqubController } from './equb.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equb } from './entities/equb.entity';
import { Period } from './entities/period.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Equb, Period])],
  controllers: [EqubController],
  providers: [EqubService],
  exports: [EqubService, TypeOrmModule]
})
export class EqubModule {}
