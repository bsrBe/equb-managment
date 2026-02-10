import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { AuthGuard } from '@nestjs/passport';
import { currentAdmin } from 'src/auth/decorators/current-admin.decorator';
import { Admin } from 'src/admin/entities/admin.entity';
import { PayoutFilterDto } from './dto/payout-filter.dto';

@Controller('payout')
@UseGuards(AuthGuard('jwt'))
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('select-random-winner')
  selectRandomWinner(@Body() createPayoutDto: CreatePayoutDto, @currentAdmin() admin: Admin) {
    return this.payoutService.selectRandomWinner(createPayoutDto.equbId, createPayoutDto.periodId, admin.id);
  }

  @Post('record-manual-winner')
  recordManualWinner(
    @Body() body: { equbId: string; memberId: string; periodId: string },
    @currentAdmin() admin: Admin,
  ) {
    return this.payoutService.recordManualWinner(body.equbId, body.memberId, body.periodId, admin.id);
  }

  @Get()
  findAll(
    @currentAdmin() admin: Admin,
    @Query() filter: PayoutFilterDto,
  ) {
    return this.payoutService.findAll(admin.id, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payoutService.remove(id);
  }
}
