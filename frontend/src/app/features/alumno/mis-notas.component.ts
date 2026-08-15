import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NotaService } from '../../core/services/nota.service';
import { NotaCurso } from '../../core/models/nota.model';
import { PromedioPipe } from '../../core/pipes/promedio.pipe';
import { ResaltarNotaDirective } from '../../core/directives/resaltar-nota.directive';

interface NotasPorCurso {
  curso: string;
  notas: NotaCurso[];
}

@Component({
  selector: 'app-mis-notas',
  standalone: true,
  imports: [DecimalPipe, PromedioPipe, ResaltarNotaDirective],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Alumno</p>
        <h1>Mis notas</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    @for (grupo of agrupadas(); track grupo.curso) {
      <div class="tarjeta">
        <h2>{{ grupo.curso }}</h2>
        <table class="tabla">
          <thead>
            <tr><th>Evaluacion</th><th>Nota</th><th>Peso (%)</th><th>Ponderado</th></tr>
          </thead>
          <tbody>
            @for (n of grupo.notas; track n.id_nota) {
              <tr>
                <td>{{ n.nombre_evaluacion }}</td>
                <td [appResaltarNota]="n.calificacion">{{ n.calificacion }}</td>
                <td>{{ n.ponderacion }}</td>
                <td>{{ n.puntajePonderado() | number: '1.2-2' }}</td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Promedio ponderado</strong></td>
              <td><strong>{{ grupo.notas | promedio }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    } @empty {
      <p class="sutil">Todavia no hay notas publicadas.</p>
    }
  `,
})
export class MisNotasComponent implements OnInit {
  private readonly servicio = inject(NotaService);

  readonly agrupadas = signal<NotasPorCurso[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.servicio.listarMisNotas().subscribe({
      next: (notas) => this.agrupadas.set(this.agrupar(notas)),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  private agrupar(notas: NotaCurso[]): NotasPorCurso[] {
    const mapa = new Map<string, NotaCurso[]>();
    notas.forEach((n) => {
      const clave = n.nombre_curso ?? `Curso ${n.id_curso}`;
      mapa.set(clave, [...(mapa.get(clave) ?? []), n]);
    });
    return [...mapa.entries()].map(([curso, lista]) => ({ curso, notas: lista }));
  }
}
