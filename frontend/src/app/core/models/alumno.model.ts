export interface AlumnoDTO {
  id_alumno: number;
  id_usuario: number;
  dni_apoderado: string;
  telefono: string;
  fecha_nacimiento: string;
  nombre?: string;
  apellido?: string;
  email?: string;
}

/** Entidad `alumno`. */
export class Alumno {
  id_alumno: number;
  id_usuario: number;
  dni_apoderado: string;
  telefono: string;
  fecha_nacimiento: string;
  nombre?: string;
  apellido?: string;
  email?: string;

  constructor(data: Partial<AlumnoDTO> = {}) {
    this.id_alumno = data.id_alumno ?? 0;
    this.id_usuario = data.id_usuario ?? 0;
    this.dni_apoderado = data.dni_apoderado ?? '';
    this.telefono = data.telefono ?? '';
    this.fecha_nacimiento = data.fecha_nacimiento ?? '';
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.email = data.email;
  }

  get nombreCompleto(): string {
    return `${this.nombre ?? ''} ${this.apellido ?? ''}`.trim();
  }

  static desdeDTO(dto: AlumnoDTO): Alumno {
    return new Alumno(dto);
  }
}
