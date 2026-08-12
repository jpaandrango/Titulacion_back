import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';
import { DataSource } from 'typeorm';
import {
  CareerEntity,
  StudentEntity,
  EnrollmentEntity,
  EnrollmentDetailEntity,
  EnrollmentStateEntity,
  EnrollmentDetailStateEntity,
  SchoolPeriodEntity,
  SubjectEntity,
  TeacherDistributionEntity,
  InstitutionEntity,
  CareerParallelEntity,
  CatalogueEntity as CoreCatalogueEntity,
} from '@modules/core/entities';
import { ConfigEnum } from '@utils/enums';

export const coreProviders = [
  {
    provide: CoreRepositoryEnum.studentRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(StudentEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CoreRepositoryEnum.careerRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CareerEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  // ─── Secretary / Enrollments ────────────────────────────────────────────────
  {
    provide: CoreRepositoryEnum.enrollmentRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EnrollmentEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CoreRepositoryEnum.enrollmentDetailRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EnrollmentDetailEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CoreRepositoryEnum.enrollmentStateRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EnrollmentStateEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CoreRepositoryEnum.enrollmentDetailStateRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EnrollmentDetailStateEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  // ─── Auxiliares reales (ya no stubs): School Periods / Career Parallels ───────
  {
    provide: CoreRepositoryEnum.schoolPeriodRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SchoolPeriodEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CoreRepositoryEnum.institutionRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(InstitutionEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  // ─── Auxiliares que siguen siendo solo para stubs (Subjects / Teacher Distributions) ──
  {
    provide: CoreRepositoryEnum.subjectRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SubjectEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  {
    provide: CoreRepositoryEnum.teacherDistributionRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TeacherDistributionEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  // ─── Endpoint público de catálogos (core/catalogues) ───────────────────────────
  {
    provide: CoreRepositoryEnum.coreCatalogueRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CoreCatalogueEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
  // ─── Cupos por paralelo (entity nueva, no toca career.entity.ts) ──────────────
  {
    provide: CoreRepositoryEnum.careerParallelRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CareerParallelEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
];
