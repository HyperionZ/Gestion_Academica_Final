import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CursoService } from '../../core/services/curso.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso } from '../../core/models/curso.model';

@Component({
  selector: 'app-mis-cursos-docente',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Docente</p>
        <h1>Mis cursos</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <div class="lista-tarjetas">
      @for (c of cursos(); track c.id_curso) {
        <a class="tarjeta tarjeta--enlace" [routerLink]="[c.id_curso, 'notas']">
          <strong>{{ c.nombre }}</strong>
          <small class="sutil">{{ c.nombre_seccion }}</small>
          <span class="flecha">Registrar notas &rarr;</span>
        </a>
      } @empty {
        <p class="sutil">Todavia no tienes cursos asignados.</p>
      }
    </div>
  `,
})
export class MisCursosDocenteComponent implements OnInit {
  private readonly servicio = inject(CursoService);
  private readonly auth = inject(AuthService);

  readonly cursos = signal<Curso[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    this.servicio.listarPorDocente(usuario.id).subscribe({
      next: (lista) => this.cursos.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
