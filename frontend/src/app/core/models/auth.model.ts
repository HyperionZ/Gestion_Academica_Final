/** Roles soportados por la aplicacion (coinciden con la tabla `rol`). */
export type Rol = 'ADMIN' | 'DOCENTE' | 'ALUMNO';

export interface Credenciales {
  email: string;
  password: string;
}

export interface UsuarioSesionDTO {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioSesionDTO;
}

/** Contenido del payload del JWT emitido por la API. */
export interface PayloadJwt {
  sub: number;
  email: string;
  rol: Rol;
  nombre: string;
  iat: number;
  exp: number;
}

/** Modelo de dominio del usuario en sesion. */
export class UsuarioAutenticado {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly email: string,
    public readonly rol: Rol
  ) {}

  get esAdmin(): boolean {
    return this.rol === 'ADMIN';
  }

  get iniciales(): string {
    return this.nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  /** Ruta de inicio segun el rol: define la carga dinamica del modulo. */
  rutaInicio(): string {
    switch (this.rol) {
      case 'ADMIN':
        return '/admin/usuarios';
      case 'DOCENTE':
        return '/docente/cursos';
      default:
        return '/alumno/cursos';
    }
  }

  static desdePayload(p: PayloadJwt): UsuarioAutenticado {
    return new UsuarioAutenticado(p.sub, p.nombre, p.email, p.rol);
  }
}
