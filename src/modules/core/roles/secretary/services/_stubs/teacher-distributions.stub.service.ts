import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeacherDistributionEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * STUB — pertenece al módulo de "Distribución de Docentes" (teacher-distributions),
 * no a Secretaría. Implementa solo findOne, que es lo que EnrollmentDetailsService necesita.
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
}
