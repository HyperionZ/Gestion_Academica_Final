import { Rol } from './auth.model';

export interface UsuarioDTO {
  id_usuario: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: number;
  id_rol: number;
  rol: Rol;
  fecha_creacion?: string;
}

/** Entidad `usuario`. */
export class Usuario {
  id_usuario: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: number;
  id_rol: number;
  rol: Rol;
  fecha_creacion?: string;

  constructor(data: Partial<UsuarioDTO> = {}) {
    this.id_usuario = data.id_usuario ?? 0;
    this.dni = data.dni ?? '';
    this.nombre = data.nombre ?? '';
    this.apellido = data.apellido ?? '';
    this.email = data.email ?? '';
    this.estado = data.estado ?? 1;
    this.id_rol = data.id_rol ?? 3;
    this.rol = data.rol ?? 'ALUMNO';
    this.fecha_creacion = data.fecha_creacion;
  }

  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  estaActivo(): boolean {
    return this.estado === 1;
  }

  static desdeDTO(dto: UsuarioDTO): Usuario {
    return new Usuario(dto);
  }
}
