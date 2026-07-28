import { Injectable } from '@nestjs/common';

/**
 * ⚠️ STUB REAL (no hay tabla) — la entidad CareerParallelEntity (paralelos por carrera,
 * con su "capacity") NO existe todavía en este proyecto (sí existía en el backend viejo).
 * Sin esa tabla no se puede consultar el cupo real de un paralelo.
 *
 * Mientras tanto, findCapacityByCareer devuelve un valor alto fijo para NO bloquear
 * la matriculación por falta de cupo. Esto es una decisión temporal:
 * ⚠️ AVISAR AL EQUIPO: hay que migrar/crear career-parallel.entity.ts y su servicio real,
 * o decidir con el tutor otra forma de definir el cupo por paralelo.
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
