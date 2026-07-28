import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
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

  // Ver nota equivalente en enrollment-details/base-enrollment-detail.dto.ts —
  // con whitelist+forbidNonWhitelisted, si el front lo manda y no está declarado acá,
  // el POST/PUT truena con "La propiedad date no está permitida".
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'El campo date debe ser una fecha' })
  readonly date: Date;
}
