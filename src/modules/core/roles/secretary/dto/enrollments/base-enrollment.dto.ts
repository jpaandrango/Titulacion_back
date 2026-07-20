import { IsNotEmpty, IsString } from 'class-validator';
import { StudentEntity, CatalogueEntity, SchoolPeriodEntity, CareerEntity } from '@modules/core/entities';
import { CreateEnrollmentsDetailDto } from '@modules/core/roles/secretary/dto';
import { isStringValidationOptions } from '@utils/dto-validation';

export class BaseEnrollmentDto {
  @IsNotEmpty()
  readonly student: StudentEntity;

  @IsNotEmpty()
  readonly academicPeriod: CatalogueEntity;

  @IsNotEmpty()
  readonly career: CareerEntity;

  @IsNotEmpty()
  readonly enrollmentDetails: CreateEnrollmentsDetailDto[];

  @IsNotEmpty()
  readonly parallel: CatalogueEntity;

  @IsNotEmpty()
  readonly schoolPeriod: SchoolPeriodEntity;

  @IsNotEmpty()
  readonly type: CatalogueEntity;

  @IsNotEmpty()
  readonly workday: CatalogueEntity;

  @IsString(isStringValidationOptions())
  readonly code: string;

  @IsString(isStringValidationOptions())
  readonly observation: string;
}
