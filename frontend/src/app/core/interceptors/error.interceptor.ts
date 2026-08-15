import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Manejo global de errores: sesion expirada (401) y acceso denegado (403). */
export const errorInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return siguiente(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !peticion.url.includes('/auth/login')) {
        auth.logout(false);
        router.navigate(['/login'], { queryParams: { expirado: 1 } });
      }
      if (error.status === 403) {
        router.navigate(['/acceso-denegado']);
      }
      return throwError(() => error);
    })
  );
};
