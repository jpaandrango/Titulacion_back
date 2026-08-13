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
  CareerParallelsService,
  SubjectsStubService,
  TeacherDistributionsStubService,
} from '@modules/core/roles/secretary/services';

/**
 * Rol: Secretaría — Matrícula (Enrollments + Enrollment Details + Reportes).
 *
 * Ver README de este módulo (o el resumen entregado junto al ZIP) para el detalle
 * de qué está portado 1:1 desde el backend viejo. School Periods y Career Parallels
 * ya son servicios reales (dejaron de ser stub). Siguen como STUB, pendientes de
 * reemplazo por el servicio oficial de otro módulo/rol: Subjects, Students, Teacher
 * Distributions.
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
    CareerParallelsService,
    // Siguen siendo stubs (dependencias de otros módulos)
    SubjectsStubService,
    TeacherDistributionsStubService,
  ],
  exports: [
    EnrollmentsService,
    EnrollmentDetailsService,
    EnrollmentStatesService,
    EnrollmentDetailStatesService,
    CoreCataloguesService,
    SchoolPeriodsService,
    CareerParallelsService,
  ],
})
export class SecretaryModule {}
