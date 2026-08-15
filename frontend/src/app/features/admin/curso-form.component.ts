import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CursoService } from '../../core/services/curso.service';

@Component({
  selector: 'app-curso-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Administracion</p>
        <h1>{{ id() ? 'Editar curso' : 'Registrar curso' }}</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <form class="tarjeta formulario" [formGroup]="formulario" (ngSubmit)="guardar()">
      <div class="grilla">
        <label class="campo">
          Nombre del curso
          <input type="text" formControlName="nombre" />
        </label>
        <label class="campo">
          Seccion
          <select formControlName="id_seccion">
            <option [ngValue]="1">A - 2026-I</option>
            <option [ngValue]="2">B - 2026-I</option>
            <option [ngValue]="3">C - 2026-I</option>
          </select>
        </label>
        <label class="campo campo--ancho">
          Descripcion
          <textarea rows="3" formControlName="descripcion"></textarea>
        </label>
        <label class="campo">
          Estado
          <select formControlName="estado">
            <option [ngValue]="1">Activo</option>
            <option [ngValue]="0">Inactivo</option>
          </select>
        </label>
      </div>

      <div class="acciones">
        <button class="btn btn--primario" type="submit" [disabled]="formulario.invalid">Guardar</button>
        <button class="btn btn--texto" type="button" (click)="volver()">Cancelar</button>
      </div>
    </form>
  `,
})
export class CursoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(CursoService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  readonly id = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    id_seccion: [1, Validators.required],
    estado: [1, Validators.required],
  });

  ngOnInit(): void {
    const parametro = this.ruta.snapshot.paramMap.get('id');
    if (!parametro) return;
    this.id.set(parametro);
    this.servicio.obtener(Number(parametro)).subscribe({
      next: (c) =>
        this.formulario.patchValue({
          nombre: c.nombre,
          descripcion: c.descripcion,
          id_seccion: c.id_seccion,
          estado: c.estado,
        }),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  guardar(): void {
    if (this.formulario.invalid) return;
    const datos = this.formulario.getRawValue();
    const peticion = this.id()
      ? this.servicio.actualizar(Number(this.id()), datos)
      : this.servicio.crear(datos);
    peticion.subscribe({
      next: () => this.volver(),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  volver(): void {
    this.router.navigate(['/admin/cursos']);
  }
}
