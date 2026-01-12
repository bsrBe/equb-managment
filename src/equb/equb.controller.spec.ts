import { Test, TestingModule } from '@nestjs/testing';
import { EqubController } from './equb.controller';
import { EqubService } from './equb.service';

describe('EqubController', () => {
  let controller: EqubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EqubController],
      providers: [EqubService],
    }).compile();

    controller = module.get<EqubController>(EqubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
