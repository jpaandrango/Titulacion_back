import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ILike, In, LessThan, Not, Repository } from 'typeorm';
import { UserEntity } from '@auth/entities';
import { CreateEnrollmentDto, FilterEnrollmentDto, UpdateEnrollmentDto } from '@modules/core/roles/secretary/dto';
import { CatalogueEntity, EnrollmentDetailEntity, EnrollmentEntity, SchoolPeriodEntity } from '@modules/core/entities';
import { EnrollmentStatesService } from '@modules/core/roles/secretary/services/enrollment-states.service';
import { EnrollmentDetailsService } from '@modules/core/roles/secretary/services/enrollment-details.service';
import { EnrollmentDetailStatesService } from '@modules/core/roles/secretary/services/enrollment-detail-states.service';
import { CoreCataloguesService } from '@modules/core/roles/secretary/services/core-catalogues.service';
import { SchoolPeriodsStubService } from '@modules/core/roles/secretary/services/_stubs/school-periods.stub.service';
import { CareerParallelsStubService } from '@modules/core/roles/secretary/services/_stubs/career-parallels.stub.service';
import { StudentsStubService } from '@modules/core/roles/secretary/services/_stubs/students.stub.service';
import { SubjectsStubService } from '@modules/core/roles/secretary/services/_stubs/subjects.stub.service';
import {
  CatalogueEnrollmentStateEnum,
  CatalogueEnrollmentsAcademicStateEnum,
  CatalogueSchoolPeriodTypeEnum,
  CatalogueCoreTypeEnum,
  CoreRepositoryEnum,
} from '@modules/core/shared-core/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';
import { PaginationDto } from '@utils/pagination';
import { isAfter, isBefore } from 'date-fns';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class EnrollmentsService {
  constructor(
    @Inject(CoreRepositoryEnum.enrollmentRepository) private readonly repository: Repository<EnrollmentEntity>,
    private readonly enrollmentsStateService: EnrollmentStatesService,
    private readonly enrollmentDetailsService: EnrollmentDetailsService,
    private readonly enrollmentDetailStatesService: EnrollmentDetailStatesService,
    private readonly cataloguesService: CoreCataloguesService,
    private readonly schoolPeriodsService: SchoolPeriodsStubService,
    private readonly careerParallelsService: CareerParallelsStubService,
    private readonly studentsService: StudentsStubService,
    private readonly subjectsService: SubjectsStubService,
  ) {}

  async create(payload: CreateEnrollmentDto): Promise<EnrollmentEntity> {
    const newEnrollment = this.repository.create(payload as any) as unknown as EnrollmentEntity;
    return await this.repository.save(newEnrollment);
  }

  async findAll(params?: FilterEnrollmentDto): Promise<ServiceResponseHttpInterface> {
    if (params && params.limit > 0 && params.page >= 0) {
      return await this.paginateAndFilter(params);
    }

    const data = await this.repository.findAndCount({
      relations: { career: true },
    });

    return { data: data[0], pagination: { totalItems: data[1], limit: 10 } };
  }

  async findOne(id: string): Promise<EnrollmentEntity> {
    const entity = await this.repository.findOne({
      relations: {
        academicPeriod: true,
        career: true,
        enrollmentStates: { state: true },
        enrollmentState: { state: true },
        parallel: true,
        student: { user: true },
        type: true,
        workday: true,
      },
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Matricula no encontrada');
    }

    return entity;
  }

  async update(id: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.repository.findOneBy({ id });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    if (payload.parallel && enrollment.parallelId != payload.parallel.id) {
      await this.enrollmentDetailsService.updateParallels(enrollment.id, payload.parallel.id);
    }

    if (payload.workday && enrollment.workdayId != payload.workday.id) {
      await this.enrollmentDetailsService.updateWorkdays(enrollment.id, payload.workday.id);
    }

    if (payload.type && enrollment.typeId != payload.type.id) {
      await this.enrollmentDetailsService.updateTypes(enrollment.id, payload.type.id);
    }

    if (payload.academicPeriod) enrollment.academicPeriodId = payload.academicPeriod.id;
    if (payload.parallel) enrollment.parallelId = payload.parallel.id;
    if (payload.type) enrollment.typeId = payload.type.id;
    if (payload.workday) enrollment.workdayId = payload.workday.id;
    if (payload.academicPeriod) enrollment.date = payload.date!;
    if (payload.observation) enrollment.observation = payload.observation;

    return await this.repository.save(enrollment);
  }

  async updateEnrolled(id: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    entity.parallelId = payload.parallel!.id;
    entity.workdayId = payload.workday!.id;

    return await this.repository.save(entity);
  }

  async updateApproved(id: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    entity.parallelId = payload.parallel!.id;
    entity.workdayId = payload.workday!.id;

    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<EnrollmentEntity> {
    const enrollment = await this.repository.findOneBy({ id });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return await this.repository.softRemove(enrollment);
  }

  async removeAll(payload: EnrollmentEntity[]): Promise<EnrollmentEntity[]> {
    return await this.repository.softRemove(payload);
  }

  private async paginateAndFilter(params: FilterEnrollmentDto): Promise<ServiceResponseHttpInterface> {
    let where: FindOptionsWhere<EnrollmentEntity> | FindOptionsWhere<EnrollmentEntity>[];
    where = {};
    let { page, search } = params;
    const { limit } = params;

    if (search) {
      search = search.trim();
      page = 0;
      where = [];
      where.push({ code: ILike(`%${search}%`) });
    }

    const response = await this.repository.findAndCount({
      relations: { career: true },
      where,
      take: limit,
      skip: this.getOffset(limit, page),
    });

    return {
      data: response[0],
      pagination: { limit, totalItems: response[1] },
    };
  }

  private async paginateAndFilterByCareer(careerId: string, params: FilterEnrollmentDto): Promise<ServiceResponseHttpInterface> {
    const where: FindOptionsWhere<EnrollmentEntity>[] = [];

    let { page, search } = params;
    const { limit } = params;

    if (search) {
      search = search.trim();
      page = 0;

      where.push(
        { schoolPeriodId: params.schoolPeriodId, student: { user: { identification: ILike(`%${search}%`) } } },
        { schoolPeriodId: params.schoolPeriodId, student: { user: { name: ILike(`%${search}%`) } } },
        { schoolPeriodId: params.schoolPeriodId, student: { user: { lastname: ILike(`%${search}%`) } } },
      );
    } else {
      if (params.academicPeriodId) {
        if (params.enrollmentStateId) {
          where.push({
            careerId,
            schoolPeriodId: params.schoolPeriodId,
            academicPeriodId: params.academicPeriodId,
            enrollmentState: { state: { id: params.enrollmentStateId } },
          });
        } else {
          where.push({
            careerId,
            schoolPeriodId: params.schoolPeriodId,
            academicPeriodId: params.academicPeriodId,
          });
        }
      } else {
        if (params.enrollmentStateId) {
          where.push({
            careerId,
            schoolPeriodId: params.schoolPeriodId,
            enrollmentState: { state: { id: params.enrollmentStateId } },
          });
        } else {
          where.push({
            careerId,
            schoolPeriodId: params.schoolPeriodId,
          });
        }
      }
    }

    const response = await this.repository.findAndCount({
      relations: {
        career: true,
        academicPeriod: true,
        parallel: true,
        enrollmentStates: { state: true },
        enrollmentState: { state: true },
        student: { user: true },
        type: true,
        workday: true,
      },
      where,
      take: limit,
      skip: this.getOffset(limit, page),
    });

    return {
      data: response[0],
      pagination: { limit, totalItems: response[1] },
    };
  }

  private getOffset(limit: number, page: number): number {
    // PaginationDto.getOffset() ya no existe en el proyecto del tutor (se reemplazó por
    // QueryBuilderHelper, pensado para búsquedas simples de un solo campo). Nuestros filtros
    // usan condiciones OR sobre relaciones (student.user.*), así que mantenemos el cálculo
    // de offset original en vez de migrar todo a QueryBuilder.
    const safePage = !page || page < 1 ? 1 : page;
    return (safePage - 1) * (limit || 10);
  }

  async findEnrollmentsByCareer(careerId: string, params?: FilterEnrollmentDto): Promise<ServiceResponseHttpInterface> {
    if (params && params.limit > 0 && params.page >= 0) {
      return await this.paginateAndFilterByCareer(careerId, params);
    }
    // Front actual siempre manda limit/page (ver EnrollmentService.findEnrollmentsByCareer), pero
    // dejamos un fallback "todos" por consistencia con el resto de findXByY del proyecto viejo.
    return await this.paginateAndFilterByCareer(careerId, { ...params, limit: 10, page: 0 } as FilterEnrollmentDto);
  }

  async findEnrollmentsByStudent(studentId: string): Promise<EnrollmentDetailEntity[]> {
    const enrollments = await this.repository.find({
      relations: {
        enrollmentDetails: {
          subject: { type: true },
          academicState: true,
          enrollmentDetailStates: { state: true },
          enrollmentDetailState: { state: true },
        },
      },
      where: { studentId },
    });

    const enrollmentDetails: any[] = [];

    for (const item of enrollments) {
      enrollmentDetails.push(...item.enrollmentDetails);
    }

    return enrollmentDetails;
  }

  async findEnrollmentByStudent(studentId: string, careerId: string): Promise<EnrollmentEntity | null> {
    const openSchoolPeriod = await this.schoolPeriodsService.findOpenSchoolPeriod();

    if (!openSchoolPeriod) {
      throw new NotFoundException('No hay un periodo lectivo abierto (SchoolPeriodsStubService)');
    }

    return await this.repository.findOne({
      relations: {
        academicPeriod: true,
        parallel: true,
        workday: true,
        schoolPeriod: true,
        enrollmentStates: { state: true },
        enrollmentState: { state: true },
      },
      where: { studentId, careerId, schoolPeriodId: openSchoolPeriod.id },
    });
  }

  async findEnrollmentSubjectsByStudent(studentId: string, schoolPeriodId: string, careerId: string): Promise<EnrollmentDetailEntity[]> {
    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const enrolledState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.ENROLLED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    const enrollment = await this.repository.findOne({
      relations: {
        enrollmentDetails: {
          academicState: true,
          subject: { academicPeriod: true },
          enrollmentDetailState: { state: true },
          grades: { partial: true },
          parallel: true,
          type: true,
          workday: true,
          incomeType: true,
        },
      },
      where: {
        studentId,
        careerId,
        schoolPeriodId,
        enrollmentDetails: { enrollmentDetailStates: { stateId: enrolledState.id } },
      },
    });

    if (enrollment) {
      return enrollment.enrollmentDetails;
    }

    return [];
  }

  async sendRegistration(userId: string, payload: any): Promise<EnrollmentEntity> {
    try {
      const filePath = join(process.cwd(), 'log-registration.txt');
      fs.appendFile(filePath, payload.toString() + '\n', (err) => {
        if (err) {
          console.log(err);
        }
      });
    } catch (error) {
      throw new Error(`Error appending to file: ${error.message}`);
    }

    let enrollment = await this.repository.findOne({
      relations: { enrollmentStates: { state: true }, enrollmentDetails: true },
      where: {
        studentId: payload.student.id,
        careerId: payload.career.id,
        schoolPeriodId: payload.schoolPeriod.id,
      },
    });

    const enrollmentTotal = await this.findTotalEnrollments(
      enrollment?.id,
      payload.career.id,
      payload.parallel.id,
      payload.schoolPeriod.id,
      payload.workday.id,
      payload.academicPeriod.id,
    );

    const capacity = await this.careerParallelsService.findCapacityByCareer(
      payload.career.id,
      payload.parallel.id,
      payload.workday.id,
      payload.academicPeriod.id,
    );

    if (capacity <= enrollmentTotal) {
      throw new BadRequestException(`No existen cupos disponibles en la jornada ${payload.workday.name} con en el paralelo ${payload.parallel.name}`);
    }

    if (!enrollment) {
      enrollment = this.repository.create();
    }

    enrollment.academicPeriodId = payload.academicPeriod.id;
    enrollment.careerId = payload.career.id;
    enrollment.parallelId = payload.parallel.id;
    enrollment.schoolPeriodId = payload.schoolPeriod.id;
    enrollment.studentId = payload.student.id;
    enrollment.workdayId = payload.workday.id;
    enrollment.applicationsAt = new Date();
    enrollment.socioeconomicScore = await this.studentsService.calculateSocioeconomicFormScore(enrollment.studentId);
    enrollment.socioeconomicCategory = this.studentsService.calculateSocioeconomicFormCategory(enrollment.socioeconomicScore);
    enrollment.socioeconomicPercentage = this.studentsService.calculateSocioeconomicFormPercentage(enrollment.socioeconomicCategory);

    enrollment = await this.repository.save(enrollment);

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    if (!enrollment.enrollmentStates || enrollment.enrollmentStates?.length === 0) {
      const registeredState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REGISTERED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      await this.enrollmentsStateService.create({
        enrollmentId: enrollment.id,
        stateId: registeredState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    if (enrollment?.enrollmentDetails) {
      await this.enrollmentDetailsService.removeAll(enrollment.enrollmentDetails);
    }

    for (const item of payload.enrollmentDetails) {
      let enrollmentNumber = await this.calculateEnrollmentDetailNumber(payload.student.id, item.id);
      enrollmentNumber = enrollmentNumber + 1;

      if (enrollmentNumber > 3) continue;

      const enrollmentDetail: any = {
        enrollmentId: enrollment.id,
        parallel: { id: enrollment.parallelId },
        subject: { id: item.id },
        type: { id: enrollment.typeId },
        workday: { id: enrollment.workdayId },
        number: enrollmentNumber,
      };

      const enrollmentDetailCreated = await this.enrollmentDetailsService.create(userId, enrollmentDetail);

      const registeredState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REGISTERED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      await this.enrollmentDetailStatesService.create({
        enrollmentDetailId: enrollmentDetailCreated.id,
        stateId: registeredState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    return enrollment;
  }

  async validateSubjectPrerequisites(subjectId: string, enrollmentId: string) {
    const subject = await this.subjectsService.findOne(subjectId);
    const enrollmentDetails = await this.enrollmentDetailsService.findEnrollmentDetailsByEnrollment(enrollmentId);

    let valid = true;
    let existSubject = false;
    let prerequisites = '';
    let namePrerequisite = '';

    for (const subjectPrerequisite of (subject as any).subjectPrerequisites ?? []) {
      namePrerequisite = `(${subjectPrerequisite.requirement.code}) ${subjectPrerequisite.requirement.name}`;

      for (const enrollmentDetail of enrollmentDetails) {
        if (subjectPrerequisite.requirement.id === enrollmentDetail.subjectId) {
          existSubject = true;

          if (!enrollmentDetail.academicState?.code || enrollmentDetail.academicState?.code === 'r') {
            prerequisites += '\n' + namePrerequisite;
            valid = false;
          }
        }
      }

      if (!existSubject) {
        prerequisites += '\n' + namePrerequisite;
        valid = false;
      }

      existSubject = false;
    }

    return valid;
  }

  async calculateEnrollmentDetailNumber(studentId: string, subjectId: string) {
    const enrollmentDetails = await this.enrollmentDetailsService.calculateEnrollmentDetailNumber(studentId, subjectId);
    return enrollmentDetails.length;
  }

  async sendRequest(userId: string, id: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    let enrollment = await this.repository.findOne({
      relations: { enrollmentDetails: { enrollmentDetailStates: true }, enrollmentStates: true },
      where: { id },
    });

    if (!enrollment) enrollment = this.repository.create();

    enrollment.applicationsAt = new Date();
    enrollment.typeId = (await this.getType(payload.schoolPeriod)).id;

    enrollment = await this.repository.save(enrollment);

    await this.enrollmentsStateService.removeAll(enrollment.enrollmentStates);

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const registeredState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REQUEST_SENT && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    await this.enrollmentsStateService.create({
      enrollmentId: enrollment.id,
      stateId: registeredState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    for (const item of enrollment.enrollmentDetails) {
      const itemState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REQUEST_SENT && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      await this.enrollmentDetailStatesService.removeAll(item.enrollmentDetailStates);

      item.type = await this.getType(payload.schoolPeriod);

      await this.enrollmentDetailsService.update(item.id, item as any);

      await this.enrollmentDetailStatesService.create({
        enrollmentDetailId: item.id,
        stateId: itemState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    return enrollment;
  }

  async approve(id: string, userId: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.repository.findOne({
      relations: { enrollmentDetails: { enrollmentDetailStates: true }, enrollmentStates: { state: true } },
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const approvedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.APPROVED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    await this.enrollmentsStateService.removeAll(enrollment.enrollmentStates);

    await this.enrollmentsStateService.create({
      enrollmentId: id,
      stateId: approvedState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    for (const item of enrollment.enrollmentDetails) {
      const itemState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.APPROVED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      await this.enrollmentDetailStatesService.removeAll(item.enrollmentDetailStates);

      await this.enrollmentDetailStatesService.create({
        enrollmentDetailId: item.id,
        stateId: itemState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    return enrollment;
  }

  async reject(id: string, userId: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.repository.findOne({
      relations: { enrollmentDetails: { enrollmentDetailStates: true }, enrollmentStates: { state: true } },
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const rejectedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REJECTED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    await this.enrollmentsStateService.removeAll(enrollment.enrollmentStates);

    await this.enrollmentsStateService.create({
      enrollmentId: id,
      stateId: rejectedState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    for (const item of enrollment.enrollmentDetails) {
      const itemState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REJECTED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      await this.enrollmentDetailStatesService.removeAll(item.enrollmentDetailStates);

      await this.enrollmentDetailStatesService.create({
        enrollmentDetailId: item.id,
        stateId: itemState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    return enrollment;
  }

  async enroll(id: string, userId: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.repository.findOne({
      relations: {
        enrollmentDetails: { enrollmentDetailStates: true },
        enrollmentStates: true,
        schoolPeriod: true,
        career: true,
        academicPeriod: true,
        student: { user: true },
      },
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    enrollment.date = new Date();
    enrollment.code = `${enrollment.schoolPeriod.code}-${enrollment.career.acronym}-${enrollment.student.user.identification}`;
    enrollment.folio = `${enrollment.schoolPeriod.code}-${enrollment.career.acronym}-${enrollment.academicPeriod.code}`;

    await this.repository.save(enrollment);

    await this.enrollmentsStateService.removeAll(enrollment.enrollmentStates);

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const enrolledState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.ENROLLED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    await this.enrollmentsStateService.create({
      enrollmentId: id,
      stateId: enrolledState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    for (const item of enrollment.enrollmentDetails) {
      const itemState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.ENROLLED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      item.date = new Date();
      await this.enrollmentDetailsService.update(item.id, item as any);

      await this.enrollmentDetailStatesService.removeAll(item.enrollmentDetailStates);

      await this.enrollmentDetailStatesService.create({
        enrollmentDetailId: item.id,
        stateId: itemState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    return enrollment;
  }

  async revoke(id: string, userId: string, payload: UpdateEnrollmentDto): Promise<EnrollmentEntity> {
    const enrollment = await this.repository.findOne({
      relations: { enrollmentDetails: { enrollmentDetailStates: true }, enrollmentStates: true },
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const revokedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REVOKED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    await this.enrollmentsStateService.removeAll(enrollment.enrollmentStates);

    await this.enrollmentsStateService.create({
      enrollmentId: id,
      stateId: revokedState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    for (const item of enrollment.enrollmentDetails) {
      const itemState = catalogues.find(
        (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REVOKED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
      );

      await this.enrollmentDetailStatesService.removeAll(item.enrollmentDetailStates);

      await this.enrollmentDetailStatesService.create({
        enrollmentDetailId: item.id,
        stateId: itemState.id,
        userId,
        date: new Date(),
        observation: payload.observation,
      });
    }

    return enrollment;
  }

  async findTotalEnrollments(
    enrollmentId: string | undefined,
    careerId: string,
    parallelId: string,
    schoolPeriodId: string,
    workdayId: string,
    academicPeriodId: string,
  ): Promise<number> {
    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const states = catalogues.filter(
      (item: any) => item.code != CatalogueEnrollmentStateEnum.REVOKED && item.type === CatalogueCoreTypeEnum.enrollments_state,
    );

    const statesId = states.map((state) => state.id);

    let total: EnrollmentEntity[] = [];

    if (enrollmentId) {
      total = await this.repository.find({
        where: {
          id: Not(enrollmentId),
          academicPeriodId,
          workdayId,
          parallelId,
          schoolPeriodId,
          careerId,
          enrollmentStates: { stateId: In(statesId) },
        },
      });
    } else {
      total = await this.repository.find({
        where: {
          academicPeriodId,
          workdayId,
          parallelId,
          schoolPeriodId,
          careerId,
          enrollmentStates: { stateId: In(statesId) },
        },
      });
    }

    return total.length;
  }

  private async getType(schoolPeriod: SchoolPeriodEntity) {
    const currentDate = new Date();

    const catalogues = (await this.cataloguesService.findCache()) as any[];

    let codeType = CatalogueSchoolPeriodTypeEnum.ESPECIAL;

    if (isAfter(currentDate, new Date(schoolPeriod.ordinaryStartedAt)) && isBefore(currentDate, new Date(schoolPeriod.ordinaryEndedAt))) {
      codeType = CatalogueSchoolPeriodTypeEnum.ORDINARY;
    }

    if (
      isAfter(currentDate, new Date(schoolPeriod.extraOrdinaryStartedAt)) &&
      isBefore(currentDate, new Date(schoolPeriod.extraOrdinaryEndedAt))
    ) {
      codeType = CatalogueSchoolPeriodTypeEnum.EXTRAORDINARY;
    }

    if (isAfter(currentDate, new Date(schoolPeriod.especialStartedAt)) && isBefore(currentDate, new Date(schoolPeriod.especialEndedAt))) {
      codeType = CatalogueSchoolPeriodTypeEnum.ESPECIAL;
    }

    return catalogues.find((type) => type.code === codeType && type.type === CatalogueCoreTypeEnum.enrollments_type);
  }

  async findEnrollmentSubjectsByTeacher(teacherId: string, params: any): Promise<EnrollmentEntity[]> {
    return await this.repository.find({
      relations: { enrollmentDetails: { subject: true } },
      where: {
        schoolPeriodId: params.schoolPeriodId,
        enrollmentDetails: { parallelId: params.parallelId, workdayId: params.workdayId },
      },
    });
  }

  async findEnrollmentCertificateByEnrollment(id: string): Promise<EnrollmentEntity | null> {
    return await this.repository.findOne({
      relations: {
        academicPeriod: true,
        career: { institution: true },
        parallel: true,
        workday: true,
        schoolPeriod: true,
        enrollmentDetails: {
          parallel: true,
          subject: { academicPeriod: true },
          enrollmentDetailStates: { state: true },
        },
        enrollmentStates: { state: true },
        student: { user: true },
      },
      where: { id },
    });
  }

  async recalculateSocioeconomicForm(): Promise<EnrollmentEntity> {
    const enrollments = await this.repository.find({
      relations: { enrollmentStates: { state: true }, enrollmentDetails: true },
      where: {
        enrollmentStates: {
          state: { code: In(['request_sent', 'approved', 'enrolled', 'revoked', 'registered', 'rejected']) },
        },
      },
    });

    for (const enrollment of enrollments) {
      enrollment.socioeconomicScore = await this.studentsService.calculateSocioeconomicFormScore(enrollment.studentId);
      enrollment.socioeconomicCategory = this.studentsService.calculateSocioeconomicFormCategory(enrollment.socioeconomicScore);
      enrollment.socioeconomicPercentage = this.studentsService.calculateSocioeconomicFormPercentage(enrollment.socioeconomicCategory);

      await this.repository.save(enrollment);
    }

    return enrollments[0];
  }

  async findLastEnrollmentDetailByStudent(studentId: string, careerId: string): Promise<string> {
    const catalogues = (await this.cataloguesService.findCache()) as any[];

    const approvedState = catalogues.find(
      (catalogue) =>
        catalogue.code === CatalogueEnrollmentsAcademicStateEnum.APPROVED && catalogue.type === CatalogueCoreTypeEnum.enrollments_academic_state,
    );

    const enrollments = await this.repository.find({
      relations: {
        enrollmentDetails: {
          subject: { type: true, academicPeriod: true },
          academicState: true,
        },
      },
      where: { careerId, studentId, enrollmentDetails: { academicStateId: approvedState.id } },
      order: { schoolPeriod: { startedAt: 'asc' }, enrollmentDetails: { subject: { code: 'asc' } } },
    });

    let lastAcademicPeriod = 0;

    for (const enrollment of enrollments) {
      for (const enrollmentDetail of enrollment.enrollmentDetails) {
        if (parseInt(enrollmentDetail.subject.academicPeriod.code) > lastAcademicPeriod) {
          lastAcademicPeriod = parseInt(enrollmentDetail.subject.academicPeriod.code);
        }
      }
    }

    return lastAcademicPeriod.toString();
  }
}
