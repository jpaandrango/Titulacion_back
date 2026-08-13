import { EnrollmentsController } from '@modules/core/roles/secretary/controllers/enrollments.controller';
import { EnrollmentDetailsController } from '@modules/core/roles/secretary/controllers/enrollment-details.controller';
import { EnrollmentReportsController } from '@modules/core/roles/secretary/controllers/enrollment-reports.controller';
import { CoreCataloguesController } from '@modules/core/roles/secretary/controllers/core-catalogues.controller';
import { SchoolPeriodsController } from '@modules/core/roles/secretary/controllers/school-periods.controller';

export const controllers = [
  EnrollmentsController,
  EnrollmentDetailsController,
  EnrollmentReportsController,
  CoreCataloguesController,
  SchoolPeriodsController,
];
