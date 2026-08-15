export interface CursoDTO {
  id_curso: number;
  id_seccion: number;
  nombre: string;
  descripcion: string;
  estado: number;
  fecha_creacion?: string;
  nombre_seccion?: string;
  nombre_docente?: string;
}

/** Entidad `curso`. */
export class Curso {
  id_curso: number;
  id_seccion: number;
  nombre: string;
  descripcion: string;
  estado: number;
  fecha_creacion?: string;
  nombre_seccion?: string;
  nombre_docente?: string;

  constructor(data: Partial<CursoDTO> = {}) {
    this.id_curso = data.id_curso ?? 0;
    this.id_seccion = data.id_seccion ?? 0;
    this.nombre = data.nombre ?? '';
    this.descripcion = data.descripcion ?? '';
    this.estado = data.estado ?? 1;
    this.fecha_creacion = data.fecha_creacion;
    this.nombre_seccion = data.nombre_seccion;
    this.nombre_docente = data.nombre_docente;
  }

  estaActivo(): boolean {
    return this.estado === 1;
  }

  static desdeDTO(dto: CursoDTO): Curso {
    return new Curso(dto);
  }
}
