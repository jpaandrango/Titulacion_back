export enum CoreRepositoryEnum {
  studentRepository = 'studentRepository',
  careerRepository = 'careerRepository',
  // Secretary / Enrollments
  enrollmentRepository = 'enrollmentRepository',
  enrollmentDetailRepository = 'enrollmentDetailRepository',
  enrollmentStateRepository = 'enrollmentStateRepository',
  enrollmentDetailStateRepository = 'enrollmentDetailStateRepository',
  // Auxiliares — usados por los stubs de dependencias externas al módulo de Secretaría.
  // Cuando exista el módulo/rol dueño de estas entidades, lo ideal es que registre
  // sus propios repos/servicios; estos quedan aquí solo para no bloquear a Secretaría.
  schoolPeriodRepository = 'schoolPeriodRepository',
  subjectRepository = 'subjectRepository',
  teacherDistributionRepository = 'teacherDistributionRepository',
  // Catálogos del esquema 'core' (enrollments_state, enrollments_type, parallel, workday,
  // academic_period, etc.) — confirmado contra el backup real que estas NO viven en
  // common.catalogues, sino en core.catalogues. Ver CoreCataloguesService.
  coreCatalogueRepository = 'coreCatalogueRepository',
}
