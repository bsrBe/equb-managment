import { IsUUID, IsNotEmpty } from 'class-validator';

export class RecordManualWinnerDto {
  @IsUUID()
  @IsNotEmpty()
  equbId: string;

  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsUUID()
  @IsNotEmpty()
  periodId: string;
}
