import { IsOptional, IsDate } from 'class-validator';
import { PaginationDto } from '@utils/pagination';

export class FilterEnrollmentDto extends PaginationDto {
  @IsOptional()
  readonly code: string;

  @IsOptional()
  @IsDate()
  readonly date: Date;

  @IsOptional()
  readonly schoolPeriodId: string;

  @IsOptional()
  readonly academicPeriodId: string;

  @IsOptional()
  readonly enrollmentStateId: string;
}
