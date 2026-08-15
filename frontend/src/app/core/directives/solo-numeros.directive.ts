import { Directive, HostListener } from '@angular/core';

/** Directiva propia: restringe un input a digitos (DNI, telefono). */
@Directive({ selector: '[appSoloNumeros]', standalone: true })
export class SoloNumerosDirective {
  @HostListener('keypress', ['$event'])
  alEscribir(evento: KeyboardEvent): void {
    if (!/^[0-9]$/.test(evento.key)) {
      evento.preventDefault();
    }
  }
}
