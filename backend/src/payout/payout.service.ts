import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payout } from './entities/payout.entity';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import { EqubMemberService } from 'src/equb-member/equb-member.service';
import { EqubService } from 'src/equb/equb.service';
import { PayoutFilterDto } from './dto/payout-filter.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { EqubMember } from 'src/equb-member/entities/equb-member.entity';
import { Equb } from 'src/equb/entities/equb.entity';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepo: Repository<Payout>,
    private readonly equbMemberService: EqubMemberService,
    private readonly equbService: EqubService,
    private readonly dataSource: DataSource,
  ) {}

  async selectRandomWinner(equbId: string, periodId: string, adminId: string) {
    const equb = await this.equbService.findOne(equbId, adminId);

    // 1. Get eligible winners (those in the same Equb who haven't won in this round yet)
    const eligibleMembers = await this.equbMemberService.getEligibleWinners(equbId, adminId);

    if (eligibleMembers.length === 0) {
      // If no eligible members, it means the round is complete. Reset and start new round if requested.
      // For now, we'll just throw an error.
      throw new BadRequestException('No eligible winners left in this round. All members have received payouts.');
    }

    const winner = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
    return this.processPayout(equb, winner, periodId, adminId);
  }

  async recordManualWinner(equbId: string, memberId: string, periodId: string, adminId: string) {
    const equb = await this.equbService.findOne(equbId, adminId);
    const member = await this.equbMemberService.findOne(memberId, adminId);

    if (member.equb.id !== equbId) throw new BadRequestException('Member does not belong to this Equb');
    if (member.hasReceivedPayout) throw new BadRequestException('Member has already received payout in this round');
    if (!member.isActive) throw new BadRequestException('Member is not active');

    return this.processPayout(equb, member, periodId, adminId);
  }

  private async processPayout(equb: Equb, member: EqubMember, periodId: string, adminId: string) {
    const payoutAmount = await this.calculatePayoutAmount(equb, member, adminId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payout = this.payoutRepo.create({
        equb: { id: equb.id },
        member: { id: member.id },
        amount: payoutAmount,
        period: { id: periodId },
        payoutDate: new Date(),
      });

      await queryRunner.manager.save(payout);
      
      member.hasReceivedPayout = true;
      await queryRunner.manager.save(member);

      await this.updateEqubStatusAfterPayout(equb, queryRunner);

      await queryRunner.commitTransaction();
      return payout;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof QueryFailedError) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to process payout');
    } finally {
      await queryRunner.release();
    }
  }

  private async calculatePayoutAmount(equb: Equb, member: EqubMember, adminId: string): Promise<number> {
    if (equb.type === 'DAILY') {
      const baseAmount = Number(member.customContributionAmount || equb.defaultContributionAmount);
      return baseAmount * (equb.payoutMultiplier || 100);
    }

    // For Weekly/Monthly – Pot calculation
    const paginatedMembers = await this.equbMemberService.findByEqub(equb.id, adminId, { page: 1, limit: 1000 } as PaginationParamsDto);
    const members = paginatedMembers.data;

    const baseAmount = Number(equb.defaultContributionAmount);
    return members.reduce((sum, m) => {
      let multiplier = 1;
      if (m.contributionType === 'HALF') multiplier = 0.5;
      if (m.contributionType === 'QUARTER') multiplier = 0.25;
      if (m.contributionType === 'CUSTOM') return sum + Number(m.customContributionAmount || 0);
      return sum + (baseAmount * multiplier);
    }, 0);
  }

  async recordMergedPayout(equbId: string, memberIds: string[], periodId: string, adminId: string) {
    const equb = await this.equbService.findOne(equbId, adminId);
    const members = await Promise.all(memberIds.map(id => this.equbMemberService.findOne(id, adminId)));
    
    // Validate members
    for (const member of members) {
      if (member.equb.id !== equbId) throw new BadRequestException(`Member ${member.id} does not belong to this Equb`);
      if (member.hasReceivedPayout) throw new BadRequestException(`Member ${member.id} has already received payout`);
      if (!member.isActive) throw new BadRequestException(`Member ${member.id} is not active`);
    }

    if (equb.type !== 'DAILY') {
      // Check merging rules for Weekly/Monthly
      const contributionTypes = members.map(m => m.contributionType);
      const isHalfMerge = contributionTypes.every(t => t === 'HALF') && members.length === 2;
      const isQuarterMerge = contributionTypes.every(t => t === 'QUARTER') && members.length === 4;

      if (!isHalfMerge && !isQuarterMerge) {
        throw new BadRequestException('Invalid merge: select 2 half-members or 4 quarter-members to settle a round');
      }
    }


    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payouts: Payout[] = [];
      for (const member of members) {
        let amount = 0;
        if (equb.type === 'DAILY') {
          // Each winner gets their own calculated payout (custom contribution * 100)
          amount = await this.calculatePayoutAmount(equb, member, adminId);
        } else {
          // Weekly/Monthly - pot is shared
          const totalPot = await this.calculatePayoutAmount(equb, members[0], adminId);
          amount = totalPot / members.length;
        }

        const payout = this.payoutRepo.create({
          equb: { id: equb.id },
          member: { id: member.id },
          amount: amount,
          period: { id: periodId },
          payoutDate: new Date(),
        }) as Payout;
        payouts.push(payout);
        
        member.hasReceivedPayout = true;
        await queryRunner.manager.save(member);
      }

      await queryRunner.manager.save(payouts);

      await this.updateEqubStatusAfterPayout(equb, queryRunner);

      await queryRunner.commitTransaction();
      return payouts;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async updateEqubStatusAfterPayout(equb: Equb, queryRunner: any) {
    const activeMembersCount = await queryRunner.manager.count(EqubMember, {
      where: { equb: { id: equb.id }, isActive: true }
    });

    const paidMembersCount = await queryRunner.manager.count(EqubMember, {
      where: { equb: { id: equb.id }, isActive: true, hasReceivedPayout: true }
    });

    if (paidMembersCount >= activeMembersCount) {
      if (equb.isInfinity) {
        // Reset for next round if infinite: mark all as not paid
        await queryRunner.manager.update(EqubMember, 
          { equb: { id: equb.id } }, 
          { hasReceivedPayout: false }
        );
        equb.currentRound += 1;
      } else {
        // For non-infinite (Weekly/Monthly), mark as completed only if all planned payouts are done.
        // If it's the "17 payouts in week 1" case, it might still have more payouts in following weeks.
        // We'll keep it ACTIVE until the admin manually closes it or some other trigger.
        // HOWEVER, if ALL members have received their payout, usually the Equb cycle is over.
        equb.status = 'COMPLETED';
      }
    }
    await queryRunner.manager.save(equb);
  }

  async findAll(
    adminId: string,
    filter: PayoutFilterDto,
  ): Promise<PaginatedResponse<Payout>> {
    const query = this.payoutRepo.createQueryBuilder('payout')
      .leftJoinAndSelect('payout.member', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('payout.equb', 'equb')
      .leftJoinAndSelect('payout.period', 'period')
      .where('equb.adminId = :adminId', { adminId });

    if (filter.memberId) {
      query.andWhere('member.id = :memberId', { memberId: filter.memberId });
    }

    if (filter.equbId) {
      query.andWhere('equb.id = :equbId', { equbId: filter.equbId });
    }

    if (filter.periodId) {
      query.andWhere('period.id = :periodId', { periodId: filter.periodId });
    }

    if (filter.minAmount) {
      query.andWhere('payout.amount >= :min', { min: filter.minAmount });
    }

    if (filter.maxAmount) {
      query.andWhere('payout.amount <= :max', { max: filter.maxAmount });
    }

    if (filter.searchTerm) {
      query.andWhere('(user.fullName ILIKE :search OR user.phoneNumber ILIKE :search)', { search: `%${filter.searchTerm}%` });
    }

    if (filter.startDate) {
      query.andWhere('payout.payoutDate >= :startDate', { startDate: filter.startDate });
    }

    if (filter.endDate) {
      query.andWhere('payout.payoutDate <= :endDate', { endDate: filter.endDate });
    }

    const [data, totalItems] = await query
      .skip(filter.skip)
      .take(filter.limit)
      .orderBy('payout.payoutDate', 'DESC')
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / filter.limit);

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: filter.limit,
        totalPages,
        currentPage: filter.page,
      },
    };
  }

  async findOne(id: string) {
    const payout = await this.payoutRepo.findOne({
      where: { id },
      relations: ['equb', 'member', 'period'],
    });
    if (!payout) throw new NotFoundException('Payout record not found');
    return payout;
  }

  remove(id: string) {
    return this.payoutRepo.delete(id);
  }
}
