import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
