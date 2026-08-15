import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { Usuario, UsuarioDTO } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseHttpService<Usuario> {
  protected readonly recurso = 'usuarios';
  protected mapear(dato: UsuarioDTO): Usuario {
    return Usuario.desdeDTO(dato);
  }
}
