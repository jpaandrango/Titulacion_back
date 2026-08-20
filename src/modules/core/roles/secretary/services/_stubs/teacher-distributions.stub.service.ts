import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeacherDistributionEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * Consulta distribuciones docentes (core.teacher_distributions) — la fuente real de
 * cupo por asignatura+paralelo+jornada+período, usada tanto por Secretaría como por
 * el módulo de Estudiante (confirmado comparando ambos: mismo patrón).
 *
 * Sigue viviendo bajo _stubs/ y con el sufijo "Stub" en el nombre de la clase — no
 * se renombró para no arrastrar el cambio de import a todos los archivos que lo
 * inyectan (secretary.module.ts, enrollments.service.ts, enrollment-details.service.ts).
 * Si se quiere renombrar más adelante, es un cambio mecánico de nombre nada más.
 */
@Injectable()
export class TeacherDistributionsStubService {
  constructor(
    @Inject(CoreRepositoryEnum.teacherDistributionRepository)
    private readonly repository: Repository<TeacherDistributionEntity>,
  ) { }

  async findOne(id: string): Promise<TeacherDistributionEntity> {
    const entity = await this.repository.findOne({
      relations: { parallel: true, teacher: { user: true }, schoolPeriod: true, subject: true, workday: true },
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`La distribución de docente con id: ${id} no se encontró`);
    }

    return entity;
  }

  // Busca la distribución docente real para una combinación puntual — el
  // reemplazo de CareerParallelsService.findCapacityByCareer(). Devuelve null (no
  // lanza) si no existe, para que el que llama decida el mensaje de error exacto
  // según el contexto (sendRegistration, create de asignatura, etc.).
  async findBySubjectParallelWorkdaySchoolPeriod(
    subjectId: string,
    parallelId: string,
    workdayId: string,
    schoolPeriodId: string,
  ): Promise<TeacherDistributionEntity | null> {
    return await this.repository.findOne({
      where: { subjectId, parallelId, workdayId, schoolPeriodId },
    });
  }
}