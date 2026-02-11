import { IsNotEmpty , IsEnum , IsDate , IsNumber , IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateEqubDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(['DAILY' , 'WEEKLY' , 'MONTHLY'])
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsNumber()
  defaultContributionAmount: number;

  @IsOptional()
  @IsNumber()
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
  startDate: Date;

    @IsString()
  status: 'ACTIVE' | 'COMPLETED';

    @Type(() => Date)
    @IsDate()
  createdAt: Date;
}