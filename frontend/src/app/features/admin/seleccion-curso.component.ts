import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CursoService } from '../../core/services/curso.service';
import { Curso } from '../../core/models/curso.model';

/** Paso previo al registro de notas: elegir el curso. */
@Component({
  selector: 'app-seleccion-curso',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Administracion</p>
        <h1>Notas por curso</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <div class="lista-tarjetas">
      @for (c of cursos(); track c.id_curso) {
        <a class="tarjeta tarjeta--enlace" [routerLink]="[c.id_curso]">
          <strong>{{ c.nombre }}</strong>
          <small class="sutil">{{ c.nombre_seccion }} &middot; {{ c.nombre_docente ?? 'Sin docente' }}</small>
          <span class="flecha">Registrar notas &rarr;</span>
        </a>
      } @empty {
        <p class="sutil">No hay cursos disponibles.</p>
      }
    </div>
  `,
})
export class SeleccionCursoComponent implements OnInit {
  private readonly servicio = inject(CursoService);
  readonly cursos = signal<Curso[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.servicio.listar().subscribe({
      next: (lista) => this.cursos.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
