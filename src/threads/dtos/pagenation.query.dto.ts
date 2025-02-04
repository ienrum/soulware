import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class PaginationQuryDto {
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;
}
