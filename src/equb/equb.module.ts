import { Module } from '@nestjs/common';
import { EqubService } from './equb.service';
import { EqubController } from './equb.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equb } from './entities/equb.entity';

@Module({
  imports : [TypeOrmModule.forFeature([Equb])],
  controllers: [EqubController],
  providers: [EqubService],
  exports: [EqubService , TypeOrmModule]
})
export class EqubModule {}
