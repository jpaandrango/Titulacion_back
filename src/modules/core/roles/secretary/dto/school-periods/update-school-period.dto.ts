import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolPeriodDto } from './create-school-period.dto';

export class UpdateSchoolPeriodDto extends PartialType(CreateSchoolPeriodDto) {}
