export enum CoreRepositoryEnum {
  studentRepository = 'studentRepository',
  careerRepository = 'careerRepository',
  // Secretary / Enrollments
  enrollmentRepository = 'enrollmentRepository',
  enrollmentDetailRepository = 'enrollmentDetailRepository',
  enrollmentStateRepository = 'enrollmentStateRepository',
  enrollmentDetailStateRepository = 'enrollmentDetailStateRepository',
  // Auxiliares — usados por los stubs de dependencias externas al módulo de Secretaría.
  schoolPeriodRepository = 'schoolPeriodRepository',
  subjectRepository = 'subjectRepository',
  teacherDistributionRepository = 'teacherDistributionRepository',
  // Catálogos del esquema 'core' (enrollments_state, enrollments_type, parallel, workday,
  // academic_period, etc.) — no viven en
  // common.catalogues, sino en core.catalogues. Ver CoreCataloguesService.
  coreCatalogueRepository = 'coreCatalogueRepository',
  institutionRepository = 'institutionRepository',
}
