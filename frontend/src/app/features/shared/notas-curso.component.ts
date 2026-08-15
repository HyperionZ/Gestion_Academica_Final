import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlumnoService } from '../../core/services/alumno.service';
import { CursoService } from '../../core/services/curso.service';
import { NotaService } from '../../core/services/nota.service';
import { Alumno } from '../../core/models/alumno.model';
import { Curso } from '../../core/models/curso.model';
import { NotaCurso } from '../../core/models/nota.model';
import { PromedioPipe } from '../../core/pipes/promedio.pipe';
import { ResaltarNotaDirective } from '../../core/directives/resaltar-nota.directive';

/**
 * Registro de notas de un curso (maximo 3 evaluaciones por alumno).
 * Se reutiliza en las rutas de admin y de docente.
 */
@Component({
  selector: 'app-notas-curso',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, PromedioPipe, ResaltarNotaDirective],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Notas del curso</p>
        <h1>{{ curso()?.nombre ?? 'Curso' }}</h1>
      </div>
    </header>

    <div class="tarjeta">
      <label class="campo">
        Alumno
        <select [value]="idAlumno() ?? ''" (change)="cambiarAlumno($event)">
          <option value="">Selecciona un alumno</option>
          @for (a of alumnos(); track a.id_alumno) {
            <option [value]="a.id_alumno">{{ a.nombreCompleto }}</option>
          }
        </select>
      </label>
    </div>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    @if (idAlumno()) {
      <div class="tarjeta">
        <table class="tabla">
          <thead>
            <tr><th>Evaluacion</th><th>Nota</th><th>Peso (%)</th><th>Ponderado</th><th></th></tr>
          </thead>
          <tbody>
            @for (n of notas(); track n.id_nota) {
              <tr>
                <td>{{ n.nombre_evaluacion }}</td>
                <td [appResaltarNota]="n.calificacion">{{ n.calificacion }}</td>
                <td>{{ n.ponderacion }}</td>
                <td>{{ n.puntajePonderado() | number: '1.2-2' }}</td>
                <td class="acciones">
                  <button class="btn btn--texto" type="button" (click)="editar(n)">Editar</button>
                  <button class="btn btn--texto btn--riesgo" type="button" (click)="eliminar(n)">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="vacio">Aun no hay evaluaciones registradas.</td></tr>
            }
          </tbody>
          <tfoot>
            <tr><td colspan="3"><strong>Promedio ponderado</strong></td><td colspan="2"><strong>{{ notas() | promedio }}</strong></td></tr>
          </tfoot>
        </table>
      </div>

      @if (puedeAgregar() || editando()) {
        <form class="tarjeta formulario" [formGroup]="formulario" (ngSubmit)="guardar()">
          <h2>{{ editando() ? 'Editar evaluacion' : 'Nueva evaluacion' }}</h2>
          <div class="grilla">
            <label class="campo">
              Nombre de la evaluacion
              <input type="text" formControlName="nombre_evaluacion" placeholder="Practica 1" />
            </label>
            <label class="campo">
              Calificacion (0 - 20)
              <input type="number" step="0.01" formControlName="calificacion" />
            </label>
            <label class="campo">
              Ponderacion (%)
              <input type="number" step="1" formControlName="ponderacion" />
            </label>
          </div>
          <div class="acciones">
            <button class="btn btn--primario" type="submit" [disabled]="formulario.invalid">Guardar</button>
            @if (editando()) {
              <button class="btn btn--texto" type="button" (click)="cancelar()">Cancelar</button>
            }
          </div>
        </form>
      } @else {
        <p class="sutil">Este alumno ya tiene el maximo de {{ maximo }} evaluaciones en el curso.</p>
      }
    }
  `,
})
export class NotasCursoComponent implements OnInit {
  /** Llega por binding de la ruta: /notas/:idCurso */
  readonly idCurso = input.required<string>();

  readonly maximo = NotaCurso.MAX_EVALUACIONES;

  private readonly fb = inject(FormBuilder);
  private readonly cursoServicio = inject(CursoService);
  private readonly alumnoServicio = inject(AlumnoService);
  private readonly notaServicio = inject(NotaService);

  readonly curso = signal<Curso | null>(null);
  readonly alumnos = signal<Alumno[]>([]);
  readonly notas = signal<NotaCurso[]>([]);
  readonly idAlumno = signal<number | null>(null);
  readonly editando = signal<NotaCurso | null>(null);
  readonly error = signal<string | null>(null);

  readonly puedeAgregar = computed(() => this.notas().length < NotaCurso.MAX_EVALUACIONES);

  readonly formulario = this.fb.nonNullable.group({
    nombre_evaluacion: ['', [Validators.required, Validators.maxLength(100)]],
    calificacion: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    ponderacion: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  ngOnInit(): void {
    const id = Number(this.idCurso());
    this.cursoServicio.obtener(id).subscribe({
      next: (c) => this.curso.set(c),
      error: (e: Error) => this.error.set(e.message),
    });
    this.alumnoServicio.listarPorCurso(id).subscribe({
      next: (lista) => this.alumnos.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  cambiarAlumno(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.idAlumno.set(valor ? Number(valor) : null);
    this.cancelar();
    this.cargarNotas();
  }

  private cargarNotas(): void {
    const alumno = this.idAlumno();
    if (!alumno) {
      this.notas.set([]);
      return;
    }
    this.notaServicio.listarPorCurso(Number(this.idCurso()), alumno).subscribe({
      next: (lista) => this.notas.set(lista),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  editar(nota: NotaCurso): void {
    this.editando.set(nota);
    this.formulario.patchValue({
      nombre_evaluacion: nota.nombre_evaluacion,
      calificacion: nota.calificacion,
      ponderacion: nota.ponderacion,
    });
  }

  cancelar(): void {
    this.editando.set(null);
    this.formulario.reset({ nombre_evaluacion: '', calificacion: 0, ponderacion: 0 });
  }

  guardar(): void {
    if (this.formulario.invalid || !this.idAlumno()) return;
    this.error.set(null);

    const cuerpo = {
      ...this.formulario.getRawValue(),
      id_curso: Number(this.idCurso()),
      id_alumno: this.idAlumno(),
    };

    const enEdicion = this.editando();
    const peticion = enEdicion
      ? this.notaServicio.actualizar(enEdicion.id_nota, cuerpo)
      : this.notaServicio.crear(cuerpo);

    peticion.subscribe({
      next: () => {
        this.cancelar();
        this.cargarNotas();
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }

  eliminar(nota: NotaCurso): void {
    if (!confirm(`Eliminar la evaluacion "${nota.nombre_evaluacion}"?`)) return;
    this.notaServicio.eliminar(nota.id_nota).subscribe({
      next: () => this.cargarNotas(),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
