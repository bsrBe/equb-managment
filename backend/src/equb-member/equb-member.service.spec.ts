import { Test, TestingModule } from '@nestjs/testing';
import { EqubMemberService } from './equb-member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EqubMember } from './entities/equb-member.entity';
import { Equb } from 'src/equb/entities/equb.entity';

describe('EqubMemberService', () => {
  let service: EqubMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EqubMemberService,
        {
          provide: getRepositoryToken(EqubMember),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Equb),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EqubMemberService>(EqubMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
