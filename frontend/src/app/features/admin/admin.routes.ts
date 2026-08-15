import { Routes } from '@angular/router';
import { UsuariosListaComponent } from './usuarios-lista.component';
import { UsuarioFormComponent } from './usuario-form.component';
import { CursosListaComponent } from './cursos-lista.component';
import { CursoFormComponent } from './curso-form.component';
import { AlumnosListaComponent } from '../shared/alumnos-lista.component';
import { SeleccionCursoComponent } from './seleccion-curso.component';
import { NotasCursoComponent } from '../shared/notas-curso.component';

/** Rutas hijas del modulo de administracion (carga diferida). */
export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
  {
    path: 'usuarios',
    title: 'Usuarios',
    children: [
      { path: '', component: UsuariosListaComponent },
      { path: 'nuevo', component: UsuarioFormComponent },
      { path: ':id/editar', component: UsuarioFormComponent },
    ],
  },
  {
    path: 'cursos',
    title: 'Cursos',
    children: [
      { path: '', component: CursosListaComponent },
      { path: 'nuevo', component: CursoFormComponent },
      { path: ':id/editar', component: CursoFormComponent },
    ],
  },
  { path: 'alumnos', title: 'Alumnos', component: AlumnosListaComponent },
  {
    path: 'notas',
    title: 'Notas',
    children: [
      { path: '', component: SeleccionCursoComponent },
      { path: ':idCurso', component: NotasCursoComponent },
    ],
  },
];
