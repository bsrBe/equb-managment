import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PaginationParamsDto } from '../../common/dto/pagination.dto';

export class AttendanceFilterDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  equbMemberId?: string;

  @IsOptional()
  @IsString()
  equbId?: string;

  @IsOptional()
  @IsString()
  periodId?: string;

  @IsOptional()
  @IsEnum(['PAID', 'MISSED', 'PENDING'])
  status?: 'PAID' | 'MISSED' | 'PENDING';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
