import { Injectable } from '@nestjs/common';

/**
 * STUB REAL (no hay tabla) — la entidad CareerParallelEntity (paralelos por carrera,
 * con su "capacity")
 * Sin esa tabla no se puede consultar el cupo real de un paralelo.
 *
 * findCapacityByCareer devuelve un valor alto fijo para no bloquear
 * la matriculación por falta de cupo.
 */
@Injectable()
export class CareerParallelsStubService {
  private static readonly FALLBACK_CAPACITY = 9999;

  async findCapacityByCareer(
    careerId: string,
    parallelId: string,
    workdayId: string,
    academicPeriodId: string,
  ): Promise<number> {
    return CareerParallelsStubService.FALLBACK_CAPACITY;
  }

  async findParallelsByCareer(careerId: string): Promise<any[]> {
    return [];
  }
}
