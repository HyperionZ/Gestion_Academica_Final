import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { Curso, CursoDTO } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class CursoService extends BaseHttpService<Curso> {
  protected readonly recurso = 'cursos';
  protected mapear(dato: CursoDTO): Curso {
    return Curso.desdeDTO(dato);
  }

  /** Cursos asignados al docente en sesion. */
  listarPorDocente(idUsuario: number): Observable<Curso[]> {
    return this.listar({ docente: idUsuario });
  }

  /** Cursos en los que el alumno esta matriculado. */
  listarPorAlumno(idUsuario: number): Observable<Curso[]> {
    return this.listar({ alumno: idUsuario });
  }
}
