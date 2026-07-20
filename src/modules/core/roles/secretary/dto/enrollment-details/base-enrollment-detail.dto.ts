import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { EnrollmentEntity, CatalogueEntity, SubjectEntity } from '@modules/core/entities';
import { isStringValidationOptions, maxValidationOptions, minValidationOptions } from '@utils/dto-validation';

export class BaseEnrollmentDetailDto {
  @IsOptional()
  readonly academicState: CatalogueEntity;

  @IsNotEmpty()
  readonly enrollmentId: string;

  @IsNotEmpty()
  readonly parallel: CatalogueEntity;
  @IsOptional()
  readonly parallelId: string;

  @IsNotEmpty()
  readonly subject: SubjectEntity;

  @IsOptional()
  readonly subjectId: string;

  @IsNotEmpty()
  readonly type: CatalogueEntity;

  @IsOptional()
  readonly typeId: string;

  @IsNotEmpty()
  readonly workday: CatalogueEntity;

  @IsOptional()
  readonly workdayId: string;

  @IsNumber({}, { message: 'El campo number debe ser un número' })
  @Min(1, minValidationOptions())
  @Max(3, maxValidationOptions())
  readonly number: number;

  @IsString(isStringValidationOptions())
  readonly observation: string;

  @IsOptional()
  @IsNumber()
  readonly finalGrade: number;

  @IsOptional()
  @IsNumber()
  readonly finalAttendance: number;
}
