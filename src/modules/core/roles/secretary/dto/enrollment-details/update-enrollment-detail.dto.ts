import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrollmentsDetailDto } from './create-enrollment-detail.dto';

// `date` ya viene heredado de BaseEnrollmentDetailDto (vía CreateEnrollmentsDetailDto),
// no hace falta redeclararlo acá.
export class UpdateEnrollmentsDetailDto extends PartialType(CreateEnrollmentsDetailDto) {}
