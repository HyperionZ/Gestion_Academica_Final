import { Routes } from '@angular/router';
import { MisCursosDocenteComponent } from './mis-cursos.component';
import { NotasCursoComponent } from '../shared/notas-curso.component';
import { AlumnosListaComponent } from '../shared/alumnos-lista.component';

/** Rutas hijas del modulo del docente (carga diferida). */
export const DOCENTE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cursos' },
  {
    path: 'cursos',
    title: 'Mis cursos',
    children: [
      { path: '', component: MisCursosDocenteComponent },
      { path: ':idCurso/notas', component: NotasCursoComponent },
    ],
  },
  { path: 'alumnos', title: 'Alumnos', component: AlumnosListaComponent },
];
