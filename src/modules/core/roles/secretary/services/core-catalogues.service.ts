import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CatalogueEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * Resuelve catálogos del esquema `core` (tabla `core.catalogues`).
 *
 * IMPORTANTE — por qué existe este servicio y no se usa `CataloguesService` de
 * `@modules/common/catalogue`: se verificó que las FK de `core.enrollments`,
 * `core.enrollment_details`, `core.enrollment_states` y `core.enrollment_detail_states`
 * apuntan a `core.catalogues(id)`, NO a `common.catalogues(id)`. `CataloguesService`
 */
@Injectable()
export class CoreCataloguesService {
  constructor(
    @Inject(CoreRepositoryEnum.coreCatalogueRepository)
    private readonly repository: Repository<CatalogueEntity>,
  ) { }

  async findCache(): Promise<CatalogueEntity[]> {
    return await this.repository.find({
      select: ['id', 'code', 'name', 'type', 'isVisible', 'parentId', 'sort'],
      order: {
        type: 'asc',
        sort: 'asc',
        name: 'asc',
      },
    });
  }

  /**
   * Filtra por `type` (usado por el endpoint HTTP público del combo de catálogos:
   * paralelo, jornada, tipo de matrícula, estado académico, período académico, etc.)
   */
  async findByType(type: string): Promise<CatalogueEntity[]> {
    const all = await this.findCache();
    return all.filter((item) => item.type === type && item.isVisible);
  }

  /**
   * Busca un catálogo puntual por code + type (ej. el estado 'open'/'close' de
   * SCHOOL_PERIODS_STATE, usado por SchoolPeriodsService.open()/close()).
   */
  async findByCode(code: string, type: string): Promise<CatalogueEntity | undefined> {
    const all = await this.findCache();
    return all.find((item) => item.code === code && item.type === type);
  }
}
