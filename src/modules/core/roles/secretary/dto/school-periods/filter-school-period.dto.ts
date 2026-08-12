import { IsOptional } from 'class-validator';
import { PaginationDto } from '@utils/pagination';

export class FilterSchoolPeriodDto extends PaginationDto {
  @IsOptional()
  readonly institutionId: string;
}
