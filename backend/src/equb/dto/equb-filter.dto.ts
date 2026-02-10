import { IsOptional, IsEnum, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationParamsDto } from '../../common/dto/pagination.dto';

export class EqubFilterDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  type?: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsOptional()
  @IsEnum(['ACTIVE', 'COMPLETED'])
  status?: 'ACTIVE' | 'COMPLETED';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minContribution?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxContribution?: number;
}
