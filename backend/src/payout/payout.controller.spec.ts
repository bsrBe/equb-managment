import { Test, TestingModule } from '@nestjs/testing';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';

describe('PayoutController', () => {
  let controller: PayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayoutController],
      providers: [
        {
          provide: PayoutService,
          useValue: {
            selectRandomWinner: jest.fn(),
            recordManualWinner: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PayoutController>(PayoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
