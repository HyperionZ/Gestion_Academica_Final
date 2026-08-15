import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="acceso">
      <form class="tarjeta acceso__form" [formGroup]="formulario" (ngSubmit)="ingresar()">
        <h1>Gestion academica</h1>
        <p class="sutil">Ingresa con tu cuenta institucional.</p>

        @if (expirado()) {
          <p class="aviso">Tu sesion vencio. Vuelve a ingresar.</p>
        }

        <label>
          Correo
          <input type="email" formControlName="email" placeholder="usuario@idat.edu.pe" />
        </label>
        @if (control('email').touched && control('email').invalid) {
          <small class="error">Escribe un correo valido.</small>
        }

        <label>
          Contrasena
          <input type="password" formControlName="password" />
        </label>
        @if (control('password').touched && control('password').invalid) {
          <small class="error">La contrasena es obligatoria.</small>
        }

        @if (error()) {
          <p class="error error--bloque">{{ error() }}</p>
        }

        <button class="btn btn--primario" type="submit" [disabled]="cargando()">
          {{ cargando() ? 'Verificando...' : 'Ingresar' }}
        </button>

        <p class="sutil sutil--pie">
          Demo: admin&#64;idat.edu.pe / docente&#64;idat.edu.pe / alumno&#64;idat.edu.pe &mdash; clave: 123456
        </p>
      </form>
    </section>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly expirado = signal(this.ruta.snapshot.queryParamMap.get('expirado') === '1');

  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  control(nombre: 'email' | 'password') {
    return this.formulario.controls[nombre];
  }

  ingresar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.login(this.formulario.getRawValue()).subscribe({
      next: (usuario) => {
        this.cargando.set(false);
        const destino = this.ruta.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(destino ?? usuario.rutaInicio());
      },
      error: (e: Error) => {
        this.cargando.set(false);
        this.error.set(e.message);
      },
    });
  }
}
