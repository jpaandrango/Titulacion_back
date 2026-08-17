import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, ILike, Not, In } from 'typeorm';
import {
  CreateEnrollmentsDetailDto,
  FilterEnrollmentsDetailDto,
  UpdateEnrollmentsDetailDto,
} from '@modules/core/roles/secretary/dto';
import { CatalogueEntity, EnrollmentDetailEntity, EnrollmentEntity } from '@modules/core/entities';
import {
  CatalogueEnrollmentStateEnum,
  CatalogueCoreTypeEnum,
  CatalogueEnrollmentsAcademicStateEnum,
  CoreRepositoryEnum,
} from '@modules/core/shared-core/enums';
import { EnrollmentDetailStatesService } from '@modules/core/roles/secretary/services/enrollment-detail-states.service';
import { CoreCataloguesService } from '@modules/core/roles/secretary/services/core-catalogues.service';
import { TeacherDistributionsStubService } from '@modules/core/roles/secretary/services/_stubs/teacher-distributions.stub.service';
import { SubjectsStubService } from '@modules/core/roles/secretary/services/_stubs/subjects.stub.service';
import { ServiceResponseHttpInterface } from '@utils/interfaces';

@Injectable()
export class EnrollmentDetailsService {
  constructor(
    @Inject(CoreRepositoryEnum.enrollmentDetailRepository)
    private readonly repository: Repository<EnrollmentDetailEntity>,
    // Solo se usa para leer enrollment.studentId al validar el límite de 3 intentos —
    // este service no administra matrículas, solo consulta el dato puntual que necesita.
    @Inject(CoreRepositoryEnum.enrollmentRepository)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    private readonly enrollmentDetailStatesService: EnrollmentDetailStatesService,
    private readonly cataloguesService: CoreCataloguesService,
    private readonly teacherDistributionsService: TeacherDistributionsStubService,
    private readonly subjectsService: SubjectsStubService,
  ) { }

  // ─── CRUD y flujo de solicitud ─────────────────────────────────────────────────
  async create(userId: string, payload: CreateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const enrollmentDetailExist = await this.repository.find({
      where: {
        enrollmentId: payload.enrollmentId,
        subjectId: payload.subject.id,
      },
    });

    if (enrollmentDetailExist.length > 0) {
      throw new BadRequestException('La asignatura ya existe, por favor ingrese otra');
    }

    // FIX: antes esto solo se topaba visualmente en el front (Math.min(count+1, 3)),
    const enrollment = await this.enrollmentRepository.findOneBy({ id: payload.enrollmentId });

    if (!enrollment) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    const previousAttempts = await this.calculateEnrollmentDetailNumber(enrollment.studentId, payload.subject.id);

    if (previousAttempts.length + 1 > 3) {
      throw new BadRequestException('El estudiante ya alcanzó el límite de 3 matrículas para esta asignatura');
    }

    // una matrícula solo puede tener UNA asignatura
    // "activa" a la vez — no varias simultáneas.
    const catalogues = await this.cataloguesService.findCache();

    const revokedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REVOKED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;
    const rejectedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REJECTED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    const activeDetail = await this.repository.findOne({
      where: {
        enrollmentId: payload.enrollmentId,
        enrollmentDetailState: { stateId: Not(In([revokedState.id, rejectedState.id])) },
      },
    });

    if (activeDetail) {
      throw new BadRequestException(
        'Esta matrícula ya tiene una asignatura activa. Anule o rechace la actual antes de crear otra.',
      );
    }

    const newEnrollmentDetail = this.repository.create();

    newEnrollmentDetail.enrollmentId = payload.enrollmentId;
    newEnrollmentDetail.number = payload.number;
    newEnrollmentDetail.observation = payload.observation;
    newEnrollmentDetail.parallelId = payload.parallel.id;
    newEnrollmentDetail.subjectId = payload.subject.id;
    newEnrollmentDetail.typeId = payload.type.id;
    newEnrollmentDetail.workdayId = payload.workday.id;

    const savedEnrollmentDetail = await this.repository.save(newEnrollmentDetail);

    // matrícula limitada a 1 asignatura activa a la
    // vez, sus campos compartidos (tipo, paralelo, horario, periodo académico) deben
    // reflejar siempre los de esa asignatura 
    const subject = await this.subjectsService.findOne(payload.subject.id);
    enrollment.typeId = payload.type.id;
    enrollment.parallelId = payload.parallel.id;
    enrollment.workdayId = payload.workday.id;
    enrollment.academicPeriodId = subject.academicPeriodId;
    await this.enrollmentRepository.save(enrollment);

    return savedEnrollmentDetail;
  }

  async sendRequest(userId: string, enrollmentDetailId: string, payload: CreateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const catalogues = await this.cataloguesService.findCache();

    const requestSentState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REQUEST_SENT && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    await this.enrollmentDetailStatesService.create({
      enrollmentDetailId: enrollmentDetailId,
      stateId: requestSentState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    return null as unknown as EnrollmentDetailEntity;
  }

  async findAll(params?: FilterEnrollmentsDetailDto): Promise<ServiceResponseHttpInterface> {
    if (params && params.limit > 0 && params.page >= 0) {
      return await this.paginateAndFilter(params);
    }

    const data = await this.repository.findAndCount({
      relations: { subject: true },
    });

    return { data: data[0], pagination: { totalItems: data[1], limit: 10 } };
  }

  async findOne(id: string): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOne({
      relations: {
        subject: { academicPeriod: true },
        academicState: true,
        type: true,
        workday: true,
        parallel: true,
        enrollmentDetailStates: { state: true },
        enrollmentDetailState: { state: true },
      },
      where: { id },
    });

    if (!enrollmentDetail) {
      throw new NotFoundException('Enrollment detail not found');
    }

    return enrollmentDetail;
  }

  async update(id: string, payload: UpdateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOne({
      relations: { academicState: true },
      where: { id },
    });

    if (!enrollmentDetail) {
      throw new NotFoundException('Detalle de matrícula no encontrado');
    }

    if (payload.parallel) enrollmentDetail.parallelId = payload.parallel.id;
    if (payload.type) enrollmentDetail.typeId = payload.type.id;
    if (payload.workday) enrollmentDetail.workdayId = payload.workday.id;
    if (payload.date) enrollmentDetail.date = payload.date;
    if (payload.observation) enrollmentDetail.observation = payload.observation;
    if (payload.finalGrade) enrollmentDetail.finalGrade = payload.finalGrade;
    if (payload.finalAttendance) enrollmentDetail.finalAttendance = payload.finalAttendance;
    if (payload.academicState) enrollmentDetail.academicState = payload.academicState as CatalogueEntity;

    // el estado académico debe ser coherente con la nota y la asistencia 
    const academicStateCode = (enrollmentDetail.academicState as CatalogueEntity)?.code;
    const grade = enrollmentDetail.finalGrade;
    const attendance = enrollmentDetail.finalAttendance;
    const MIN_APPROVING_GRADE = 7;
    const MIN_APPROVING_ATTENDANCE = 70;

    if (academicStateCode && grade !== null && grade !== undefined && attendance !== null && attendance !== undefined) {
      const meetsApprovingMinimums = grade >= MIN_APPROVING_GRADE && attendance >= MIN_APPROVING_ATTENDANCE;

      if (academicStateCode === CatalogueEnrollmentsAcademicStateEnum.APPROVED && !meetsApprovingMinimums) {
        throw new BadRequestException(
          `No se puede marcar "Aprobado" con una calificación menor a ${MIN_APPROVING_GRADE} o asistencia menor al ${MIN_APPROVING_ATTENDANCE}%`,
        );
      }

      if (academicStateCode === CatalogueEnrollmentsAcademicStateEnum.REPROVED && meetsApprovingMinimums) {
        throw new BadRequestException(
          'No se puede marcar "Reprobado" con una calificación y asistencia que cumplen el mínimo para aprobar',
        );
      }
    }

    const savedEnrollmentDetail = await this.repository.save(enrollmentDetail);

    if (payload.parallel || payload.type || payload.workday) {
      const enrollment = await this.enrollmentRepository.findOneBy({ id: enrollmentDetail.enrollmentId });

      if (enrollment) {
        if (payload.parallel) enrollment.parallelId = payload.parallel.id;
        if (payload.type) enrollment.typeId = payload.type.id;
        if (payload.workday) enrollment.workdayId = payload.workday.id;
        await this.enrollmentRepository.save(enrollment);
      }
    }

    return savedEnrollmentDetail;
  }

  async updateParallels(enrollmentId: string, parallelId: string): Promise<EnrollmentDetailEntity[]> {
    const enrollmentDetails = await this.repository.findBy({ enrollmentId });

    for (const enrollmentDetail of enrollmentDetails) {
      enrollmentDetail.parallelId = parallelId;
      await this.repository.save(enrollmentDetail);
    }

    return enrollmentDetails;
  }

  async updateWorkdays(enrollmentId: string, workdayId: string): Promise<EnrollmentDetailEntity[]> {
    const enrollmentDetails = await this.repository.findBy({ enrollmentId });

    for (const enrollmentDetail of enrollmentDetails) {
      enrollmentDetail.workdayId = workdayId;
      await this.repository.save(enrollmentDetail);
    }

    return enrollmentDetails;
  }

  async updateTypes(enrollmentId: string, typeId: string): Promise<EnrollmentDetailEntity[]> {
    const enrollmentDetails = await this.repository.findBy({ enrollmentId });

    for (const enrollmentDetail of enrollmentDetails) {
      enrollmentDetail.typeId = typeId;
      await this.repository.save(enrollmentDetail);
    }

    return enrollmentDetails;
  }

  async remove(id: string): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOneBy({ id });

    if (!enrollmentDetail) {
      throw new NotFoundException('enrollmentDetail not found');
    }

    return await this.repository.softRemove(enrollmentDetail);
  }

  async removeAll(payload: EnrollmentDetailEntity[] | CreateEnrollmentsDetailDto[]): Promise<EnrollmentDetailEntity[]> {
    return await this.repository.softRemove(payload);
  }

  private async paginateAndFilter(params: FilterEnrollmentsDetailDto): Promise<ServiceResponseHttpInterface> {
    let where: FindOptionsWhere<EnrollmentDetailEntity> | FindOptionsWhere<EnrollmentDetailEntity>[];
    where = {};
    let { page, search } = params;
    const { limit } = params;

    if (search) {
      search = search.trim();
      page = 0;
      where = [];
      where.push({ observation: ILike(`%${search}%`) });
    }

    const response = await this.repository.findAndCount({
      where,
      relations: { subject: true },
      skip: this.getOffset(limit, page),
      take: limit,
    });

    return {
      data: response[0],
      pagination: { limit, totalItems: response[1] },
    };
  }

  private getOffset(limit: number, page: number): number {
    // Ver nota equivalente en enrollments.service.ts — PaginationDto.getOffset() ya no existe.
    const safePage = !page || page < 1 ? 1 : page;
    return (safePage - 1) * (limit || 10);
  }

  // ─── Consultas para otros roles (Teacher) ──────────────────────────────────────
  async findEnrollmentDetailsByEnrollment(enrollmentId: string): Promise<EnrollmentDetailEntity[]> {
    return await this.repository.find({
      relations: {
        parallel: true,
        academicState: true,
        enrollmentDetailStates: { state: true },
        enrollmentDetailState: { state: true },
        subject: { academicPeriod: true },
        type: true,
        workday: true,
      },
      where: { enrollmentId },
    });
  }

  async findTotalEnrollmentDetails(parallelId: string, schoolPeriodId: string, workdayId: string): Promise<number> {
    const catalogues = await this.cataloguesService.findCache();
    const states = catalogues.filter((item) => item.type === CatalogueCoreTypeEnum.enrollments_state);
    const state = states.find((item) => item.code === CatalogueEnrollmentStateEnum.REGISTERED)!;

    const total = await this.repository.find({
      where: {
        workdayId,
        parallelId,
        enrollment: { schoolPeriodId },
        enrollmentDetailStates: { stateId: state.id },
      },
    });

    return total.length;
  }

  // ─── Acciones de estado (misma lógica que Enrollments, a nivel de asignatura) ──
  async approve(id: string, userId: string, payload: UpdateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOne({
      relations: { enrollmentDetailStates: { state: true } },
      where: { id },
    });

    if (!enrollmentDetail) {
      throw new NotFoundException('Detalle Matrícula no encontrado');
    }

    const catalogues = await this.cataloguesService.findCache();

    const approvedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.APPROVED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    await this.enrollmentDetailStatesService.removeAll(enrollmentDetail.enrollmentDetailStates);

    await this.enrollmentDetailStatesService.create({
      enrollmentDetailId: id,
      stateId: approvedState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    return enrollmentDetail;
  }

  async reject(id: string, userId: string, payload: UpdateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOne({
      relations: { enrollmentDetailStates: { state: true } },
      where: { id },
    });

    if (!enrollmentDetail) {
      throw new NotFoundException('Matrícula no encontrada');
    }

    const catalogues = await this.cataloguesService.findCache();

    const rejectedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REJECTED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    await this.enrollmentDetailStatesService.removeAll(enrollmentDetail.enrollmentDetailStates);

    await this.enrollmentDetailStatesService.create({
      enrollmentDetailId: id,
      stateId: rejectedState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    return enrollmentDetail;
  }

  async enroll(id: string, userId: string, payload: UpdateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOne({
      relations: { enrollmentDetailStates: true },
      where: { id },
    });

    if (!enrollmentDetail) {
      throw new NotFoundException('Detalle de matrícula no encontrado');
    }

    enrollmentDetail.date = new Date();

    await this.repository.save(enrollmentDetail);

    const catalogues = await this.cataloguesService.findCache();

    const enrolledState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.ENROLLED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    await this.enrollmentDetailStatesService.removeAll(enrollmentDetail.enrollmentDetailStates);

    await this.enrollmentDetailStatesService.create({
      enrollmentDetailId: id,
      stateId: enrolledState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    return enrollmentDetail;
  }

  async revoke(id: string, userId: string, payload: UpdateEnrollmentsDetailDto): Promise<EnrollmentDetailEntity> {
    const enrollmentDetail = await this.repository.findOne({
      relations: { enrollmentDetailStates: true },
      where: { id },
    });

    if (!enrollmentDetail) {
      throw new NotFoundException('Detalle de matrícula no encontrado');
    }

    const catalogues = await this.cataloguesService.findCache();

    const revokedState = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.REVOKED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    await this.enrollmentDetailStatesService.removeAll(enrollmentDetail.enrollmentDetailStates);

    await this.enrollmentDetailStatesService.create({
      enrollmentDetailId: id,
      stateId: revokedState.id,
      userId,
      date: new Date(),
      observation: payload.observation,
    });

    return enrollmentDetail;
  }

  // ─── Más consultas cruzadas (Teacher) y helper de número de matrícula ──────────
  async findEnrollmentDetailsByTeacherDistribution(teacherDistributionId: string): Promise<EnrollmentDetailEntity[]> {
    const teacherDistribution = await this.teacherDistributionsService.findOne(teacherDistributionId);

    const catalogues = await this.cataloguesService.findCache();
    const enrollmentStateEnrolled = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.ENROLLED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    return await this.repository.find({
      relations: {
        academicState: true,
        attendances: { partial: true },
        grades: { partial: true },
        parallel: true,
        enrollmentDetailState: { state: true },
        subject: { academicPeriod: true },
        type: true,
        workday: true,
        enrollment: { student: { user: true } },
      },
      where: {
        enrollment: {
          schoolPeriodId: teacherDistribution.schoolPeriodId,
          enrollmentState: { stateId: enrollmentStateEnrolled.id },
        },
        subjectId: teacherDistribution.subjectId,
        parallelId: teacherDistribution.parallelId,
        workdayId: teacherDistribution.workdayId,
        enrollmentDetailState: { stateId: enrollmentStateEnrolled.id },
      },
      order: { enrollment: { student: { user: { lastname: 'asc', name: 'asc' } } } },
    });
  }

  async calculateEnrollmentDetailNumber(studentId: string, subjectId: string) {
    const catalogues = await this.cataloguesService.findCache();

    const enrolled = catalogues.find(
      (catalogue) => catalogue.code === CatalogueEnrollmentStateEnum.ENROLLED && catalogue.type === CatalogueCoreTypeEnum.enrollments_state,
    )!;

    const failed = catalogues.find((catalogue) => catalogue.code === 'r' && catalogue.type === CatalogueCoreTypeEnum.enrollments_academic_state)!;

    return await this.repository.find({
      where: {
        academicStateId: failed.id,
        subjectId,
        enrollmentDetailState: { stateId: enrolled.id },
        enrollment: { studentId },
      },
    });
  }
}