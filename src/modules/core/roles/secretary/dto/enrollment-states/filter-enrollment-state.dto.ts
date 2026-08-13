import { IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@utils/pagination';

export class FilterEnrollmentStateDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  readonly number: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly date: Date;
}
