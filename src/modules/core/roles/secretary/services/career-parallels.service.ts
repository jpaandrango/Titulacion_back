import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CareerParallelEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * Requiere que la tabla `core.career_parallels` exista en la base de datos real y
 * tenga datos cargados por carrera+paralelo+jornada+período académico. 
 */
@Injectable()
export class CareerParallelsService {
  constructor(
    @Inject(CoreRepositoryEnum.careerParallelRepository)
    private readonly repository: Repository<CareerParallelEntity>,
  ) { }

  async findCapacityByCareer(
    careerId: string,
    parallelId: string,
    workdayId: string,
    academicPeriodId: string,
  ): Promise<number> {
    const response = await this.repository.findOne({
      where: { careerId, workdayId, parallelId, academicPeriodId },
    });

    if (!response) {
      return 0;
    }

    return response.capacity;
  }

  async findParallelsByCareer(careerId: string): Promise<CareerParallelEntity[]> {
    return await this.repository.find({
      relations: { parallel: true, workday: true },
      where: { careerId },
    });
  }

}
