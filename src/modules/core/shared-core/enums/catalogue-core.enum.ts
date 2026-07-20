export enum CatalogueCoreTypeEnum {
  adventure_tourism_modality_items = 'adventure_tourism_modality_items',
  users_blood_type = 'users_blood_type',
  users_ethnic_origin = 'users_ethnic_origin',
  users_gender = 'users_gender',
  users_marital_status = 'users_marital_status',
  users_nationality = 'users_nationality',
  users_sex = 'users_sex',
  users_security_question = 'users_security_question',
  // Secretary / Enrollments — valores REALES de core.catalogues.type, confirmados
  // contra la BD restaurada (ver respuesta de GET .../enrollments/careers/:id).
  // OJO: no coinciden en formato con EnrollmentCatalogueTypeEnum del front (ese es para
  // el endpoint genérico /common/catalogues, que apunta a OTRA tabla — common.catalogues).
  academic_period = 'ACADEMIC_PERIOD',
  enrollments_type = 'ENROLLMENT_TYPE',
  enrollments_state = 'ENROLLMENT_STATE',
  enrollments_workday = 'ENROLLMENTS_WORKDAY',
  enrollments_academic_state = 'ENROLLMENTS_ACADEMIC_STATE',
  parallel = 'PARALLEL',
}

export enum CatalogueStateEnum {
  enabled = 'enabled',
  disabled = 'disabled',
}

export enum CatalogueEthnicOriginEnum {
  indigenous = 'indigenous',
  afro_ecuadorian = 'afro_ecuadorian',
  montubio = 'montubio',
  half_blood = 'half_blood',
  white = 'white',
}

export enum CatalogueMaritalStatusEnum {
  single = 'single',
  married = 'married',
  widower = 'widower',
  divorced = 'divorced',
  free_union = 'free_union',
}

export enum CatalogueEnrollmentStateEnum {
  REQUEST_SENT = 'request_sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ENROLLED = 'enrolled',
  REVOKED = 'revoked',
  REGISTERED = 'registered',
}

export enum CatalogueEnrollmentsAcademicStateEnum {
  APPROVED = 'a',
  REPROVED = 'r',
}

export enum CatalogueSchoolPeriodStateEnum {
  OPEN = 'open',
  CLOSE = 'close',
}

export enum CatalogueSchoolPeriodTypeEnum {
  ORDINARY = 'ordinary',
  EXTRAORDINARY = 'extraordinary',
  ESPECIAL = 'especial',
}

export enum CatalogueSubjectRequirementTypeEnum {
  PREREQUISITE = 'prerequisite',
  CO_REQUISITE = 'co_requisite',
}

export enum CatalogueCareersModalityEnum {
  ON_SITE = 'on-site',
  SEMI_ON_SITE = 'semi-on-site',
  DISTANCE = 'distance',
  DUAL = 'dual',
  ONLINE = 'online',
  HYBRID = 'hybrid',
}

export enum CatalogueEthnicOriginEnum {
  INDIGENOUS = 'indigenous',
  AFRO_ECUADORIAN = 'afro_ecuadorian',
  MONTUBIO = 'montubio',
  HALF_BLOOD = 'half_blood',
  WHITE = 'white',
}
