export interface NotaCursoDTO {
  id_nota: number;
  id_curso: number;
  id_alumno: number;
  nombre_evaluacion: string;
  calificacion: number;
  ponderacion: number;
  fecha_registro?: string;
  nombre_curso?: string;
  nombre_alumno?: string;
}

/** Entidad `nota_curso`. Maximo 3 evaluaciones por alumno y curso. */
export class NotaCurso {
  static readonly MAX_EVALUACIONES = 3;
  static readonly NOTA_APROBATORIA = 13;

  id_nota: number;
  id_curso: number;
  id_alumno: number;
  nombre_evaluacion: string;
  calificacion: number;
  ponderacion: number;
  fecha_registro?: string;
  nombre_curso?: string;
  nombre_alumno?: string;

  constructor(data: Partial<NotaCursoDTO> = {}) {
    this.id_nota = data.id_nota ?? 0;
    this.id_curso = data.id_curso ?? 0;
    this.id_alumno = data.id_alumno ?? 0;
    this.nombre_evaluacion = data.nombre_evaluacion ?? '';
    this.calificacion = Number(data.calificacion ?? 0);
    this.ponderacion = Number(data.ponderacion ?? 0);
    this.fecha_registro = data.fecha_registro;
    this.nombre_curso = data.nombre_curso;
    this.nombre_alumno = data.nombre_alumno;
  }

  /** Aporte de la evaluacion al promedio final. */
  puntajePonderado(): number {
    return (this.calificacion * this.ponderacion) / 100;
  }

  estaAprobada(): boolean {
    return this.calificacion >= NotaCurso.NOTA_APROBATORIA;
  }

  static desdeDTO(dto: NotaCursoDTO): NotaCurso {
    return new NotaCurso(dto);
  }

  /** Promedio ponderado; si la suma de pesos no llega a 100 se normaliza. */
  static promedio(notas: NotaCurso[]): number {
    if (!notas.length) return 0;
    const pesos = notas.reduce((t, n) => t + n.ponderacion, 0);
    const puntaje = notas.reduce((t, n) => t + n.puntajePonderado(), 0);
    const resultado = pesos > 0 ? (puntaje * 100) / pesos : 0;
    return Math.round(resultado * 100) / 100;
  }
}
