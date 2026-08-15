import { Component, OnInit, inject, signal } from '@angular/core';
import { CursoService } from '../../core/services/curso.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso } from '../../core/models/curso.model';

@Component({
  selector: 'app-mis-cursos-alumno',
  standalone: true,
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Alumno</p>
        <h1>Mis cursos</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <div class="lista-tarjetas">
      @for (c of cursos(); track c.id_curso) {
        <article class="tarjeta">
          <strong>{{ c.nombre }}</strong>
          <small class="sutil">{{ c.descripcion }}</small>
          <small class="sutil">Seccion {{ c.nombre_seccion }} &middot; {{ c.nombre_docente ?? 'Sin docente' }}</small>
        </article>
      } @empty {
        <p class="sutil">No tienes matriculas activas.</p>
      }
    </div>
  `,
})
export class MisCursosAlumnoComponent implements OnInit {
  private readonly servicio = inject(CursoService);
  private readonly auth = inject(AuthService);

  readonly cursos = signal<Curso[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    this.servicio.listarPorAlumno(usuario.id).subscribe({
      next: (lista) => this.cursos.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
