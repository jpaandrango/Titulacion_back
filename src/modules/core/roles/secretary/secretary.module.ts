import { Global, Module } from '@nestjs/common';
import { SharedCoreModule } from '@modules/core/shared-core/shared-core.module';
import { coreProviders } from '@modules/core/core.provider';
import { controllers } from '@modules/core/roles/secretary/controllers';
import {
  EnrollmentsService,
  EnrollmentDetailsService,
  EnrollmentStatesService,
  EnrollmentDetailStatesService,
  EnrollmentSqlService,
  EnrollmentReportsService,
  CoreCataloguesService,
  SchoolPeriodsService,
  SubjectsStubService,
  TeacherDistributionsStubService,
} from '@modules/core/roles/secretary/services';

/**
 * Rol: Secretaría — Matrícula (Enrollments + Enrollment Details + Reportes).
 * 
 * NOTA: este módulo usa CoreCataloguesService (propio, sobre core.catalogues), NO
 * CataloguesService de @modules/common/catalogue — ver la nota en core-catalogues.service.ts.
 */
@Global()
@Module({
  imports: [SharedCoreModule],
  controllers,
  providers: [
    ...coreProviders,
    // Matrícula (core del módulo)
    EnrollmentsService,
    EnrollmentDetailsService,
    EnrollmentStatesService,
    EnrollmentDetailStatesService,
    EnrollmentSqlService,
    EnrollmentReportsService,
    // Servicios reales que antes eran stub
    CoreCataloguesService,
    SchoolPeriodsService,
    TeacherDistributionsStubService,
    // Siguen siendo stubs (dependencias de otros módulos)
    SubjectsStubService,
  ],
  exports: [
    EnrollmentsService,
    EnrollmentDetailsService,
    EnrollmentStatesService,
    EnrollmentDetailStatesService,
    CoreCataloguesService,
    SchoolPeriodsService,
  ],
})
export class SecretaryModule { }
