import { Routes } from '@angular/router';
import { MisCursosAlumnoComponent } from './mis-cursos.component';
import { MisNotasComponent } from './mis-notas.component';

/** Rutas hijas del modulo del alumno (carga diferida). */
export const ALUMNO_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cursos' },
  { path: 'cursos', title: 'Mis cursos', component: MisCursosAlumnoComponent },
  { path: 'notas', title: 'Mis notas', component: MisNotasComponent },
];
