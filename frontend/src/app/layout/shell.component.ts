import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface Enlace {
  ruta: string;
  etiqueta: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="barra">
        <div class="marca">
          <span class="marca__punto"></span>
          <div>
            <strong>Gestion academica</strong>
            <small>Escuela de Tecnologia</small>
          </div>
        </div>

        <nav>
          @for (enlace of enlaces(); track enlace.ruta) {
            <a [routerLink]="enlace.ruta" routerLinkActive="activo">{{ enlace.etiqueta }}</a>
          }
        </nav>

        <div class="sesion">
          <span class="avatar">{{ usuario()?.iniciales }}</span>
          <div class="sesion__datos">
            <strong>{{ usuario()?.nombre }}</strong>
            <small>{{ usuario()?.rol }}</small>
          </div>
          <button type="button" class="btn btn--texto" (click)="cerrarSesion()">Cerrar sesion</button>
        </div>
      </aside>

      <main class="contenido">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  readonly usuario = this.auth.usuario;

  readonly enlaces = computed<Enlace[]>(() => {
    const rol = this.usuario()?.rol;
    if (rol === 'ADMIN') {
      return [
        { ruta: '/admin/usuarios', etiqueta: 'Usuarios' },
        { ruta: '/admin/cursos', etiqueta: 'Cursos' },
        { ruta: '/admin/alumnos', etiqueta: 'Alumnos' },
        { ruta: '/admin/notas', etiqueta: 'Notas' },
      ];
    }
    if (rol === 'DOCENTE') {
      return [
        { ruta: '/docente/cursos', etiqueta: 'Mis cursos' },
        { ruta: '/docente/alumnos', etiqueta: 'Alumnos' },
      ];
    }
    return [
      { ruta: '/alumno/cursos', etiqueta: 'Mis cursos' },
      { ruta: '/alumno/notas', etiqueta: 'Mis notas' },
    ];
  });

  cerrarSesion(): void {
    this.auth.logout();
  }
}
