import { Test, TestingModule } from '@nestjs/testing';
import { EqubMemberController } from './equb-member.controller';
import { EqubMemberService } from './equb-member.service';

describe('EqubMemberController', () => {
  let controller: EqubMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EqubMemberController],
      providers: [
        {
          provide: EqubMemberService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByEqub: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EqubMemberController>(EqubMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
