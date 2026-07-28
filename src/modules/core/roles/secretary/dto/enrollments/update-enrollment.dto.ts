import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateEnrollmentDto } from './create-enrollment.dto';
import { SchoolPeriodEntity } from '@modules/core/entities';

// `date` ya viene heredado de BaseEnrollmentDto (vía CreateEnrollmentDto).
export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @IsOptional()
  @IsString({ message: 'El campo folio debe ser un string' })
  readonly folio: string;

  @IsOptional()
  readonly schoolPeriod: SchoolPeriodEntity;
}
