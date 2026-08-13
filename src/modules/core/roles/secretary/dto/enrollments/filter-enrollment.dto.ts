import { IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { PaginationDto } from '@utils/pagination';
import { minValidationOptions } from '@utils/dto-validation';

// PaginationDto (compartido) exige `page` positivo (>0), pero el front pagina con
// PrimeNG, que manda `page` empezando en 0 (convención propia de esa librería). En vez
// de tocar el DTO compartido (afectaría a todos los roles), se omite `page` acá y se
// redefine solo para Enrollments, permitiendo 0 en adelante.
export class FilterEnrollmentDto extends OmitType(PaginationDto, ['page'] as const) {
  @Type(() => Number)
  @IsOptional()
  @Min(0, minValidationOptions())
  readonly page: number;

  @IsOptional()
  readonly code: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly date: Date;

  @IsOptional()
  readonly schoolPeriodId: string;

  @IsOptional()
  readonly academicPeriodId: string;

  @IsOptional()
  readonly enrollmentStateId: string;
}
