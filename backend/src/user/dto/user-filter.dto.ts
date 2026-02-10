import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationParamsDto } from '../../common/dto/pagination.dto';

export class UserFilterDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
