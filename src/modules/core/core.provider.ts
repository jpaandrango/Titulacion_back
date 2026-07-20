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
  // ─── Auxiliares para stubs de Secretary (ver nota en repository.enum.ts) ────
  {
    provide: CoreRepositoryEnum.schoolPeriodRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SchoolPeriodEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
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
  {
    provide: CoreRepositoryEnum.coreCatalogueRepository,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CoreCatalogueEntity),
    inject: [ConfigEnum.PG_DATA_SOURCE],
  },
];
