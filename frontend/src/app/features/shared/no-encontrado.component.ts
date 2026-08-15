import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mensaje">
      <p class="mensaje__codigo">404</p>
      <h1>Esta ruta no existe</h1>
      <p class="sutil">Revisa la direccion o regresa al inicio.</p>
      <a class="btn btn--primario" routerLink="/login">Volver al inicio</a>
    </section>
  `,
})
export class NoEncontradoComponent {}
