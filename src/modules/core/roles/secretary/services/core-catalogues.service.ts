import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CatalogueEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * Resuelve catálogos del esquema `core` (tabla `core.catalogues`).
 *
 * ⚠️ IMPORTANTE — por qué existe este servicio y no se usa `CataloguesService` de
 * `@modules/common/catalogue`: se verificó contra el backup real de la BD
 * (`backup_dev_yec_v2_2026_07_18_1.backup`) que las FK de `core.enrollments`,
 * `core.enrollment_details`, `core.enrollment_states` y `core.enrollment_detail_states`
 * apuntan a `core.catalogues(id)`, NO a `common.catalogues(id)`. `CataloguesService`
 * (común) consulta `common.catalogues`, que solo contiene catálogos genéricos de
 * persona (sexo, tipo de sangre, estado civil, nacionalidad, etc.) — NO contiene
 * `enrollments_state`, `enrollments_type`, `parallel`, `workday` ni `academic_period`.
 * Usar `CataloguesService` aquí habría hecho fallar en runtime cada
 * approve/reject/enroll/revoke (el `.find()` nunca habría encontrado los catálogos).
 *
 * Mantiene la misma firma que `CataloguesService.findCache()` para que sea un
 * reemplazo directo dentro del módulo de Secretaría.
 */
@Injectable()
export class CoreCataloguesService {
  constructor(
    @Inject(CoreRepositoryEnum.coreCatalogueRepository)
    private readonly repository: Repository<CatalogueEntity>,
  ) {}

  async findCache(): Promise<CatalogueEntity[]> {
    // TODO: si más roles empiezan a necesitar catálogos de 'core', vale la pena moverle
    // el cacheo (cache-manager, igual que CataloguesService) a shared-core en vez de
    // dejarlo solo aquí. Por ahora, scope mínimo para Secretaría.
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
}
