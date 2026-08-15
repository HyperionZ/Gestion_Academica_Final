import { Pipe, PipeTransform } from '@angular/core';
import { NotaCurso } from '../models/nota.model';

/** Pipe propio: calcula el promedio ponderado de un arreglo de notas. */
@Pipe({ name: 'promedio', standalone: true })
export class PromedioPipe implements PipeTransform {
  transform(notas: NotaCurso[] | null | undefined): string {
    if (!notas || !notas.length) return '--';
    return NotaCurso.promedio(notas).toFixed(2);
  }
}
