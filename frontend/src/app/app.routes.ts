import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Ruta publica
  {
    path: 'login',
    canActivate: [loginGuard],
    title: 'Iniciar sesion',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },

  // Rutas protegidas: comparten el layout y exigen sesion activa
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'docente',
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] },
        loadChildren: () =>
          import('./features/docente/docente.routes').then((m) => m.DOCENTE_ROUTES),
      },
      {
        path: 'alumno',
        canActivate: [roleGuard],
        data: { roles: ['ALUMNO'] },
        loadChildren: () =>
          import('./features/alumno/alumno.routes').then((m) => m.ALUMNO_ROUTES),
      },
    ],
  },

  {
    path: 'acceso-denegado',
    title: 'Acceso denegado',
    loadComponent: () =>
      import('./features/shared/acceso-denegado.component').then(
        (m) => m.AccesoDenegadoComponent
      ),
  },

  // Manejo de rutas inexistentes
  {
    path: '**',
    title: 'Pagina no encontrada',
    loadComponent: () =>
      import('./features/shared/no-encontrado.component').then(
        (m) => m.NoEncontradoComponent
      ),
  },
];
