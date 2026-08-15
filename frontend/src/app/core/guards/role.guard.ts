import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/auth.model';

/**
 * Autoriza el acceso segun el rol declarado en `data.roles` de la ruta.
 * Ej.: { path: 'admin', canActivate: [roleGuard], data: { roles: ['ADMIN'] } }
 */
export const roleGuard: CanActivateFn = (ruta) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const permitidos = (ruta.data['roles'] ?? []) as Rol[];
  if (!permitidos.length || auth.tieneRol(permitidos)) return true;

  return router.createUrlTree(['/acceso-denegado']);
};
