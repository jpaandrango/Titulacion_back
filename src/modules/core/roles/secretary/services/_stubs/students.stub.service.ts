import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StudentEntity } from '@modules/core/entities';
import { CoreRepositoryEnum } from '@modules/core/shared-core/enums';

/**
 * ⚠️ STUB — pertenece al módulo de "Estudiantes" (students), no a Secretaría.
 *
 * calculateSocioeconomicFormCategory / calculateSocioeconomicFormPercentage son funciones
 * puras (sin BD) portadas TAL CUAL del backend viejo — no requieren cambios.
 *
 * calculateSocioeconomicFormScore SÍ requiere leer TODO el formulario socioeconómico del
 * estudiante (información familiar, vivienda, ingresos, discapacidad, etc. — decenas de
 * campos de InformationStudentEntity) y aplicar la fórmula de puntaje del backend viejo.
 * Esa lógica pertenece al módulo de Estudiantes y no se portó aquí: se devuelve 0 con un
 * TODO explícito para que se conecte al StudentsService real cuando exista.
 */
@Injectable()
export class StudentsStubService {
  constructor(
    @Inject(CoreRepositoryEnum.studentRepository)
    private readonly repository: Repository<StudentEntity>,
  ) {}

  async calculateSocioeconomicFormScore(studentId: string): Promise<number> {
    // TODO: portar la fórmula real desde StudentsService (backend viejo, ~370 líneas)
    // una vez que el módulo de Estudiantes esté disponible en este proyecto.
    return 0;
  }

  calculateSocioeconomicFormCategory(score: number): string {
    if (score >= 0 && score <= 25) return 'D';
    if (score >= 25.05 && score <= 50.05) return 'C';
    if (score >= 50.1 && score <= 75.1) return 'B';
    if (score >= 75.15 && score <= 100) return 'A';
    return 'Sin Categoria';
  }

  calculateSocioeconomicFormPercentage(category: string): number {
    switch (category) {
      case 'A':
        return 40;
      case 'B':
        return 30;
      case 'C':
        return 20;
      case 'D':
        return 10;
      default:
        return 0;
    }
  }
}
