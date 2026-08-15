import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { SoloNumerosDirective } from '../../core/directives/solo-numeros.directive';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, SoloNumerosDirective],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Administracion</p>
        <h1>{{ id() ? 'Editar usuario' : 'Registrar usuario' }}</h1>
      </div>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <form class="tarjeta formulario" [formGroup]="formulario" (ngSubmit)="guardar()">
      <div class="grilla">
        <label class="campo">
          DNI
          <input type="text" maxlength="8" appSoloNumeros formControlName="dni" />
        </label>
        <label class="campo">
          Nombre
          <input type="text" formControlName="nombre" />
        </label>
        <label class="campo">
          Apellido
          <input type="text" formControlName="apellido" />
        </label>
        <label class="campo">
          Correo
          <input type="email" formControlName="email" />
        </label>
        <label class="campo">
          Rol
          <select formControlName="rol">
            <option value="ADMIN">Administrador</option>
            <option value="DOCENTE">Docente</option>
            <option value="ALUMNO">Alumno</option>
          </select>
        </label>
        <label class="campo">
          Estado
          <select formControlName="estado">
            <option [ngValue]="1">Activo</option>
            <option [ngValue]="0">Inactivo</option>
          </select>
        </label>
        @if (!id()) {
          <label class="campo">
            Contrasena
            <input type="password" formControlName="password" />
          </label>
        }
      </div>

      <div class="acciones">
        <button class="btn btn--primario" type="submit" [disabled]="formulario.invalid">Guardar</button>
        <button class="btn btn--texto" type="button" (click)="volver()">Cancelar</button>
      </div>
    </form>
  `,
})
export class UsuarioFormComponent implements OnInit {
  /** Parametro dinamico de la ruta :id (vacio cuando es alta). */
  readonly id = signal<string | undefined>(undefined);

  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['ALUMNO', Validators.required],
    estado: [1, Validators.required],
    password: ['123456', [Validators.minLength(6)]],
  });

  private readonly ruta = inject(ActivatedRoute);

  ngOnInit(): void {
    const parametro = this.ruta.snapshot.paramMap.get('id');
    if (parametro) {
      this.id.set(parametro);
      this.servicio.obtener(Number(parametro)).subscribe({
        next: (u) =>
          this.formulario.patchValue({
            dni: u.dni,
            nombre: u.nombre,
            apellido: u.apellido,
            email: u.email,
            rol: u.rol,
            estado: u.estado,
          }),
        error: (e: Error) => this.error.set(e.message),
      });
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
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
    this.router.navigate(['/admin/usuarios']);
  }
}
