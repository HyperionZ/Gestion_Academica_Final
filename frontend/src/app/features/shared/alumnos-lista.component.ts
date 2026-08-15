import { Component, OnInit, inject, signal } from '@angular/core';
import { AlumnoService } from '../../core/services/alumno.service';
import { Alumno } from '../../core/models/alumno.model';

@Component({
  selector: 'app-alumnos-lista',
  standalone: true,
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">{{ subtitulo() }}</p>
        <h1>Alumnos</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <div class="tarjeta">
      <table class="tabla">
        <thead>
          <tr><th>Alumno</th><th>Correo</th><th>Telefono</th><th>DNI apoderado</th><th>Nacimiento</th></tr>
        </thead>
        <tbody>
          @for (a of alumnos(); track a.id_alumno) {
            <tr>
              <td>{{ a.nombreCompleto }}</td>
              <td>{{ a.email }}</td>
              <td>{{ a.telefono }}</td>
              <td>{{ a.dni_apoderado }}</td>
              <td>{{ a.fecha_nacimiento }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="vacio">No hay alumnos registrados.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AlumnosListaComponent implements OnInit {
  private readonly servicio = inject(AlumnoService);
  readonly alumnos = signal<Alumno[]>([]);
  readonly error = signal<string | null>(null);
  readonly subtitulo = signal('Consulta');

  ngOnInit(): void {
    this.servicio.listar().subscribe({
      next: (lista) => this.alumnos.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
