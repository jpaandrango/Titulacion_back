import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
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

  @Type(() => Number)
  @IsNumber({}, { message: 'El campo number debe ser un número' })
  @Min(1, minValidationOptions())
  @Max(3, maxValidationOptions())
  readonly number: number;

  @IsString(isStringValidationOptions())
  readonly observation: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly finalGrade: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly finalAttendance: number;

  // El front lo manda tanto al crear como al editar (aunque en el back-end solo se usa
  // realmente al matricular/enroll) — con whitelist+forbidNonWhitelisted activados,
  // si no está declarado acá el POST de creación truena con "La propiedad date no
  // está permitida".
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'El campo date debe ser una fecha' })
  readonly date: Date;
}
