import { IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { PaginationDto } from '@utils/pagination';
import { minValidationOptions } from '@utils/dto-validation';

// PaginationDto compartido exige page > 0.
export class FilterEnrollmentsDetailDto extends OmitType(PaginationDto, ['page'] as const) {
  @Type(() => Number)
  @IsOptional()
  @Min(0, minValidationOptions())
  readonly page: number;

  @IsOptional()
  @IsNumber()
  readonly number: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly date: Date;
}
