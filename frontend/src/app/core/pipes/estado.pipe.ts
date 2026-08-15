import { Pipe, PipeTransform } from '@angular/core';

/** Pipe propio: convierte el TINYINT `estado` en una etiqueta legible. */
@Pipe({ name: 'estado', standalone: true })
export class EstadoPipe implements PipeTransform {
  transform(valor: number | boolean | null | undefined): string {
    return valor === 1 || valor === true ? 'Activo' : 'Inactivo';
  }
}
