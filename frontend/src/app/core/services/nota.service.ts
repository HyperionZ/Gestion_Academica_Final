import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { NotaCurso, NotaCursoDTO } from '../models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotaService extends BaseHttpService<NotaCurso> {
  protected readonly recurso = 'notas';
  protected mapear(dato: NotaCursoDTO): NotaCurso {
    return NotaCurso.desdeDTO(dato);
  }

  listarPorCurso(idCurso: number, idAlumno?: number): Observable<NotaCurso[]> {
    return this.listar({ curso: idCurso, alumno: idAlumno });
  }

  /** Notas del alumno en sesion (la API filtra por el token). */
  listarMisNotas(): Observable<NotaCurso[]> {
    return this.listar({ mias: 1 });
  }
}
