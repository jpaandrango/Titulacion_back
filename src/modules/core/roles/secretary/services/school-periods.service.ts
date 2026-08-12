import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateSchoolPeriodDto, UpdateSchoolPeriodDto } from '@modules/core/roles/secretary/dto';
import { InstitutionEntity, SchoolPeriodEntity } from '@modules/core/entities';
import { CoreCataloguesService } from '@modules/core/roles/secretary/services/core-catalogues.service';
import { CatalogueSchoolPeriodStateEnum, CatalogueCoreTypeEnum, CoreRepositoryEnum } from '@modules/core/shared-core/enums';
import { ServiceResponseHttpInterface } from '@utils/interfaces';


@Injectable()
export class SchoolPeriodsService {
  constructor(
    @Inject(CoreRepositoryEnum.schoolPeriodRepository)
    private readonly repository: Repository<SchoolPeriodEntity>,
    @Inject(CoreRepositoryEnum.institutionRepository)
    private readonly institutionRepository: Repository<InstitutionEntity>,
    private readonly coreCataloguesService: CoreCataloguesService,
  ) { }

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  async create(payload: CreateSchoolPeriodDto): Promise<SchoolPeriodEntity> {
    const institution = (await this.institutionRepository.find())[0];
    const newEntity = this.repository.create({ ...payload, institution });
    return await this.repository.save(newEntity);
  }

  async findAll(): Promise<ServiceResponseHttpInterface> {
    const response = await this.repository.find({
      relations: { state: true },
      order: { code: 'desc' },
    });

    return {
      data: response,
      pagination: { totalItems: response.length, limit: response.length },
    };
  }

  async findOne(id: string): Promise<SchoolPeriodEntity> {
    const entity = await this.repository.findOne({
      relations: { state: true },
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Periodo lectivo no encontrado');
    }

    return entity;
  }

  async findOpenSchoolPeriod(): Promise<SchoolPeriodEntity | null> {
    return await this.repository.findOne({
      relations: { state: true },
      where: {
        state: { code: CatalogueSchoolPeriodStateEnum.OPEN },
      },
    });
  }

  async update(id: string, payload: UpdateSchoolPeriodDto): Promise<SchoolPeriodEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Periodo lectivo no encontrado');
    }

    this.repository.merge(entity, payload);

    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<SchoolPeriodEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Periodo lectivo no encontrado');
    }

    return await this.repository.softRemove(entity);
  }

  async removeAll(payload: SchoolPeriodEntity[]): Promise<SchoolPeriodEntity[]> {
    return await this.repository.softRemove(payload);
  }

  // ─── Acciones de estado (visibilidad + abrir/cerrar matrícula) ────────────────
  async hide(id: string): Promise<SchoolPeriodEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Periodo lectivo no encontrado');
    }

    entity.isVisible = false;
    return await this.repository.save(entity);
  }

  async reactivate(id: string): Promise<SchoolPeriodEntity> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException('Periodo lectivo no encontrado');
    }

    entity.isVisible = true;
    return await this.repository.save(entity);
  }

  async open(id: string): Promise<SchoolPeriodEntity> {
    const entity = await this.findOne(id);
    const all = (await this.findAll()).data as SchoolPeriodEntity[];
    const existOpenSchoolPeriod = all.find(
      (item) => item.id !== id && item.state?.code === CatalogueSchoolPeriodStateEnum.OPEN,
    );

    if (entity.state?.code === CatalogueSchoolPeriodStateEnum.OPEN) {
      throw new BadRequestException('Ya existe un periodo lectivo abierto');
    }

    if (existOpenSchoolPeriod) {
      throw new BadRequestException(`Ya existe un periodo lectivo abierto (${existOpenSchoolPeriod.name})`);
    }

    const openState = await this.coreCataloguesService.findByCode(
      CatalogueSchoolPeriodStateEnum.OPEN,
      CatalogueCoreTypeEnum.school_periods_state,
    );

    if (!openState) {
      throw new NotFoundException("No se encontró el catálogo de estado 'open' para períodos lectivos");
    }

    entity.state = openState;
    return await this.repository.save(entity);
  }

  async close(id: string): Promise<SchoolPeriodEntity> {
    const entity = await this.findOne(id);

    if (entity.state?.code === CatalogueSchoolPeriodStateEnum.CLOSE) {
      throw new BadRequestException('Este periodo lectivo ya está cerrado');
    }

    const closeState = await this.coreCataloguesService.findByCode(
      CatalogueSchoolPeriodStateEnum.CLOSE,
      CatalogueCoreTypeEnum.school_periods_state,
    );

    if (!closeState) {
      throw new NotFoundException("No se encontró el catálogo de estado 'close' para períodos lectivos");
    }

    entity.state = closeState;
    return await this.repository.save(entity);
  }
}
