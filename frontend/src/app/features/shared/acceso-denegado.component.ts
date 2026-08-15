import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  template: `
    <section class="mensaje">
      <p class="mensaje__codigo">403</p>
      <h1>Esta seccion es de otro rol</h1>
      <p class="sutil">Tu cuenta no tiene permisos para abrir esta ruta.</p>
      <button class="btn btn--primario" type="button" (click)="volver()">Ir a mi inicio</button>
    </section>
  `,
})
export class AccesoDenegadoComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  volver(): void {
    const usuario = this.auth.usuario();
    this.router.navigateByUrl(usuario ? usuario.rutaInicio() : '/login');
  }
}
