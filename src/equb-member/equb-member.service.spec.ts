import { Test, TestingModule } from '@nestjs/testing';
import { EqubMemberService } from './equb-member.service';

describe('EqubMemberService', () => {
  let service: EqubMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EqubMemberService],
    }).compile();

    service = module.get<EqubMemberService>(EqubMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
