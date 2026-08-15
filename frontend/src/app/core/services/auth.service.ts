import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Credenciales,
  PayloadJwt,
  RespuestaLogin,
  Rol,
  UsuarioAutenticado,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly LLAVE_TOKEN = 'da3.token';

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _usuario = signal<UsuarioAutenticado | null>(this.recuperarSesion());

  /** Estado de sesion expuesto como signals de solo lectura. */
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);

  login(credenciales: Credenciales): Observable<UsuarioAutenticado> {
    return this.http
      .post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, credenciales)
      .pipe(
        tap((respuesta) => localStorage.setItem(AuthService.LLAVE_TOKEN, respuesta.token)),
        map((respuesta) => {
          const u = new UsuarioAutenticado(
            respuesta.usuario.id_usuario,
            `${respuesta.usuario.nombre} ${respuesta.usuario.apellido}`,
            respuesta.usuario.email,
            respuesta.usuario.rol
          );
          this._usuario.set(u);
          return u;
        }),
        catchError((e) =>
          throwError(() => new Error(e.error?.mensaje ?? 'No se pudo iniciar sesion.'))
        )
      );
  }

  logout(redirigir = true): void {
    localStorage.removeItem(AuthService.LLAVE_TOKEN);
    this._usuario.set(null);
    if (redirigir) {
      this.router.navigate(['/login']);
    }
  }

  token(): string | null {
    return localStorage.getItem(AuthService.LLAVE_TOKEN);
  }

  /** Valida existencia y vigencia del token (control de expiracion). */
  estaAutenticado(): boolean {
    const payload = this.leerPayload();
    if (!payload) return false;
    const vigente = payload.exp * 1000 > Date.now();
    if (!vigente) this.logout(false);
    return vigente;
  }

  tieneRol(roles: Rol[]): boolean {
    const usuario = this._usuario();
    return !!usuario && roles.includes(usuario.rol);
  }

  private leerPayload(): PayloadJwt | null {
    const token = this.token();
    if (!token) return null;
    try {
      const cuerpo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(cuerpo)) as PayloadJwt;
    } catch {
      return null;
    }
  }

  private recuperarSesion(): UsuarioAutenticado | null {
    const payload = this.leerPayload();
    if (!payload || payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem(AuthService.LLAVE_TOKEN);
      return null;
    }
    return UsuarioAutenticado.desdePayload(payload);
  }
}
