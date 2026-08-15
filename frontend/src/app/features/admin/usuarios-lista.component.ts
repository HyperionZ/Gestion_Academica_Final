import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { EstadoPipe } from '../../core/pipes/estado.pipe';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [RouterLink, EstadoPipe],
  template: `
    <header class="encabezado">
      <div>
        <p class="eyebrow">Administracion</p>
        <h1>Usuarios</h1>
      </div>
      <a class="btn btn--primario" routerLink="nuevo">Registrar usuario</a>
    </header>

    @if (error()) { <p class="error error--bloque">{{ error() }}</p> }

    <div class="tarjeta">
      @if (cargando()) {
        <p class="sutil">Cargando usuarios...</p>
      } @else {
        <table class="tabla">
          <thead>
            <tr><th>DNI</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            @for (u of usuarios(); track u.id_usuario) {
              <tr>
                <td>{{ u.dni }}</td>
                <td>{{ u.nombreCompleto }}</td>
                <td>{{ u.email }}</td>
                <td><span class="etiqueta">{{ u.rol }}</span></td>
                <td>{{ u.estado | estado }}</td>
                <td class="acciones">
                  <a class="btn btn--texto" [routerLink]="[u.id_usuario, 'editar']">Editar</a>
                  <button class="btn btn--texto btn--riesgo" type="button" (click)="eliminar(u)">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="vacio">No hay usuarios registrados.</td></tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class UsuariosListaComponent implements OnInit {
  private readonly servicio = inject(UsuarioService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.cargando.set(false);
      },
    });
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`Eliminar a ${usuario.nombreCompleto}?`)) return;
    this.servicio.eliminar(usuario.id_usuario).subscribe({
      next: () => this.cargar(),
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
