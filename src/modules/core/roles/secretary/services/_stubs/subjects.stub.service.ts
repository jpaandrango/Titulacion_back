import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubjectEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * STUB — pertenece al módulo de "Asignaturas" (subjects), no a Secretaría.
 * Implementa solo findOne, que es lo que EnrollmentsService necesita.
 * Reemplazar por el SubjectsService oficial cuando exista.
 */
@Injectable()
export class SubjectsStubService {
  constructor(
    @Inject(CoreRepositoryEnum.subjectRepository)
    private readonly repository: Repository<SubjectEntity>,
  ) { }

  async findOne(id: string): Promise<SubjectEntity> {
    const subject = await this.repository.findOne({
      relations: { academicPeriod: true, state: true, type: true },
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    return subject;
  }
}
