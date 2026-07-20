import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SchoolPeriodEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * STUB — pertenece al módulo de "Períodos Lectivos" (school-periods), no a Secretaría.
 * Implementa solo lo que EnrollmentsService necesita, con consulta real a BD
 */
@Injectable()
export class SchoolPeriodsStubService {
  constructor(
    @Inject(CoreRepositoryEnum.schoolPeriodRepository)
    private readonly repository: Repository<SchoolPeriodEntity>,
  ) { }

  async findOpenSchoolPeriod(): Promise<SchoolPeriodEntity | null> {
    return await this.repository.findOne({
      where: { state: { code: 'open' } as any },
    });
  }
}
