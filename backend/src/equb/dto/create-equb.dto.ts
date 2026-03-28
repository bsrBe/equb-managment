import { IsNotEmpty , IsEnum , IsDate , IsNumber , IsString, IsOptional, IsBoolean, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateEqubDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(['DAILY' , 'WEEKLY' , 'MONTHLY'])
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Contribution amount must be greater than 0' })
  defaultContributionAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Total rounds must be at least 1' })
  totalRounds?: number;

  @IsOptional()
  @IsNumber()
  payoutMultiplier?: number;

  @IsOptional()
  @IsBoolean()
  isInfinity?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Expected member count must be at least 1' })
  expectedMemberCount?: number;
}

export class EqubResponseDto {
    @IsString()
  id: string;

    @IsString()
  name: string;

    @IsEnum(['DAILY' , 'WEEKLY' , 'MONTHLY'])
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';

    @IsNumber()
  defaultContributionAmount: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
  startDate?: Date;

    @IsEnum(['PENDING' , 'ACTIVE' , 'COMPLETED'])
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';

    @IsNumber()
  totalRounds: number;

    @IsNumber()
  payoutMultiplier: number;

    @IsBoolean()
  isInfinity: boolean;

    @Type(() => Date)
    @IsDate()
  createdAt: Date;
}