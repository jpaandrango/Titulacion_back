import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogueEntity } from '@modules/core/entities';
import { isStringValidationOptions } from '@utils/dto-validation';

export class SchoolPeriodDto {
  @IsNotEmpty()
  readonly state: CatalogueEntity;

  @IsNotEmpty()
  @IsString(isStringValidationOptions())
  readonly code: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly codeSniese: string;

  @IsOptional()
  @IsBoolean()
  readonly isVisible: boolean;

  @IsNotEmpty()
  @IsString(isStringValidationOptions())
  readonly name: string;

  @IsOptional()
  @IsString(isStringValidationOptions())
  readonly shortName: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly startedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly endedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly ordinaryStartedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly ordinaryEndedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly extraOrdinaryStartedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly extraOrdinaryEndedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly especialStartedAt: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly especialEndedAt: Date;
}
