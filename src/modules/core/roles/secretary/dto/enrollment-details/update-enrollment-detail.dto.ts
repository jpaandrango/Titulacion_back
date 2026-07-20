import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsOptional } from 'class-validator';
import { CreateEnrollmentsDetailDto } from './create-enrollment-detail.dto';

export class UpdateEnrollmentsDetailDto extends PartialType(CreateEnrollmentsDetailDto) {
  @IsOptional()
  @IsDate({ message: 'El campo date debe ser una fecha' })
  readonly date: Date;
}
