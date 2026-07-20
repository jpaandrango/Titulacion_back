import { IsNumber, IsOptional, IsDate } from 'class-validator';
import { PaginationDto } from '@utils/pagination';

export class FilterEnrollmentDetailStateDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  readonly number: number;

  @IsOptional()
  @IsDate()
  readonly date: Date;
}
