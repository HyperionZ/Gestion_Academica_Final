import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { Alumno, AlumnoDTO } from '../models/alumno.model';

@Injectable({ providedIn: 'root' })
export class AlumnoService extends BaseHttpService<Alumno> {
  protected readonly recurso = 'alumnos';
  protected mapear(dato: AlumnoDTO): Alumno {
    return Alumno.desdeDTO(dato);
  }

  /** Alumnos matriculados en un curso. */
  listarPorCurso(idCurso: number): Observable<Alumno[]> {
    return this.listar({ curso: idCurso });
  }
}
