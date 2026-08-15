import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Evita que un usuario con sesion activa vuelva al login. */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado()) return true;

  const usuario = auth.usuario();
  return router.parseUrl(usuario ? usuario.rutaInicio() : '/login');
};
