import { Test, TestingModule } from '@nestjs/testing';
import { PayoutService } from './payout.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { EqubMemberService } from 'src/equb-member/equb-member.service';
import { EqubService } from 'src/equb/equb.service';
import { DataSource } from 'typeorm';

describe('PayoutService', () => {
  let service: PayoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        {
          provide: getRepositoryToken(Payout),
          useValue: {},
        },
        {
          provide: EqubMemberService,
          useValue: {
            getEligibleWinners: jest.fn(),
            resetPayouts: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: EqubService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
