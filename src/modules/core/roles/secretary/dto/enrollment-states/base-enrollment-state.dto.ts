import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseEnrollmentStateDto {
  @IsNotEmpty()
  readonly enrollmentId: string;

  @IsNotEmpty()
  readonly stateId: string;

  @IsNotEmpty()
  readonly userId: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'El campo date debe ser una fecha' })
  readonly date?: Date;

  @IsOptional()
  readonly observation?: string;
}
