import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationParamsDto } from '../../common/dto/pagination.dto';

export class MemberFilterDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  equbId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasReceivedPayout?: boolean;

  @IsOptional()
  @IsEnum(['FULL', 'HALF', 'QUARTER'])
  contributionType?: 'FULL' | 'HALF' | 'QUARTER';
}
