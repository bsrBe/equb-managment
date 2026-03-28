import { IsUUID, IsArray, IsNotEmpty } from 'class-validator';

export class MergePayoutDto {
  @IsUUID()
  @IsNotEmpty()
  equbId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  memberIds: string[];

  @IsUUID()
  @IsNotEmpty()
  periodId: string;
}
