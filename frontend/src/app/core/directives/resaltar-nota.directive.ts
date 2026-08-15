import { Directive, ElementRef, inject, input, effect } from '@angular/core';

/** Directiva propia: colorea una calificacion segun su rango. */
@Directive({ selector: '[appResaltarNota]', standalone: true })
export class ResaltarNotaDirective {
  readonly appResaltarNota = input<number>(0);
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    effect(() => {
      const nota = Number(this.appResaltarNota());
      const estilo = this.el.nativeElement.style;
      estilo.fontWeight = '600';
      if (nota >= 17) estilo.color = '#1b7f5a';
      else if (nota >= 13) estilo.color = '#2f4b7c';
      else estilo.color = '#b02a37';
    });
  }
}
