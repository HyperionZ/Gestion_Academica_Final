import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CursoService } from '../../core/services/curso.service';
import { Curso } from '../../core/models/curso.model';
import { EstadoPipe } from '../../core/pipes/estado.pipe';

@Component({
  selector: 'app-cursos-lista',
  standalone: true,
  imports: [RouterLink, EstadoPipe],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Administracion</p>
        <h1>Cursos</h1>
      </div>
      <a class="btn btn--primario" routerLink="nuevo">Registrar curso</a>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <div class="tarjeta">
      <table class="tabla">
        <thead>
          <tr><th>Curso</th><th>Seccion</th><th>Docente</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          @for (c of cursos(); track c.id_curso) {
            <tr>
              <td>
                <strong>{{ c.nombre }}</strong>
                <small class="sutil">{{ c.descripcion }}</small>
              </td>
              <td>{{ c.nombre_seccion }}</td>
              <td>{{ c.nombre_docente ?? 'Sin asignar' }}</td>
              <td>{{ c.estado | estado }}</td>
              <td class="acciones">
                <a class="btn btn--texto" [routerLink]="[c.id_curso, 'editar']">Editar</a>
                <a class="btn btn--texto" [routerLink]="['/admin/notas', c.id_curso]">Notas</a>
                <button class="btn btn--texto btn--riesgo" type="button" (click)="eliminar(c)">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="vacio">No hay cursos registrados.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CursosListaComponent implements OnInit {
  private readonly servicio = inject(CursoService);
  readonly cursos = signal<Curso[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.servicio.listar().subscribe({
      next: (lista) => this.cursos.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  eliminar(curso: Curso): void {
    if (!confirm(`Eliminar el curso ${curso.nombre}?`)) return;
    this.servicio.eliminar(curso.id_curso).subscribe({
      next: () => this.cargar(),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
