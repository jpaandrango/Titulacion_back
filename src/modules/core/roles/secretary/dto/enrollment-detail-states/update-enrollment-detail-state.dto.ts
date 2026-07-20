import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrollmentDetailStateDto } from './create-enrollment-detail-state.dto';

export class UpdateEnrollmentDetailStateDto extends PartialType(CreateEnrollmentDetailStateDto) {}
