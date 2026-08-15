import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio base que centraliza la logica HTTP (herencia + generics).
 * Cada entidad solo declara su recurso y como mapear el DTO a su modelo.
 */
export abstract class BaseHttpService<T> {
  protected readonly http = inject(HttpClient);

  protected abstract readonly recurso: string;
  protected abstract mapear(dato: any): T;

  protected get url(): string {
    return `${environment.apiUrl}/${this.recurso}`;
  }

  protected construirParams(filtros: Record<string, string | number | undefined>): HttpParams {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    });
    return params;
  }

  listar(filtros: Record<string, string | number | undefined> = {}): Observable<T[]> {
    return this.http
      .get<any[]>(this.url, { params: this.construirParams(filtros) })
      .pipe(
        map((lista) => lista.map((item) => this.mapear(item))),
        catchError((e) => this.manejarError(e))
      );
  }

  obtener(id: number): Observable<T> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(
      map((item) => this.mapear(item)),
      catchError((e) => this.manejarError(e))
    );
  }

  crear(cuerpo: unknown): Observable<T> {
    return this.http.post<any>(this.url, cuerpo).pipe(
      map((item) => this.mapear(item)),
      catchError((e) => this.manejarError(e))
    );
  }

  actualizar(id: number, cuerpo: unknown): Observable<T> {
    return this.http.put<any>(`${this.url}/${id}`, cuerpo).pipe(
      map((item) => this.mapear(item)),
      catchError((e) => this.manejarError(e))
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(catchError((e) => this.manejarError(e)));
  }

  protected manejarError(error: HttpErrorResponse): Observable<never> {
    const mensaje =
      error.error?.mensaje ??
      (error.status === 0
        ? 'No se pudo conectar con la API. Verifica que el servidor este encendido.'
        : `Error ${error.status} al consultar ${this.recurso}.`);
    return throwError(() => new Error(mensaje));
  }
}
