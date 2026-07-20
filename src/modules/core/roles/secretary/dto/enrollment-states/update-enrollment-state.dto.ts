import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrollmentStateDto } from './create-enrollment-state.dto';

export class UpdateEnrollmentStateDto extends PartialType(CreateEnrollmentStateDto) {}
