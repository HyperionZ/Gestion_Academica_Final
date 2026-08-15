# Desarrollo de Interfaces 3 — Evaluación final

## Avance preliminar: Sistema de Gestión Académica (SPA en Angular)

**Escuela de Tecnología — IDAT**
**Modalidad:** grupal (3 integrantes)
**Repositorio GitHub:** _(pegar aquí el enlace del repositorio con el README.md)_

| Integrante | Responsabilidad |
|---|---|
| _(completar)_ | Diseño de rutas, guards y layout |
| _(completar)_ | Servicios REST, interceptores y autenticación JWT |
| _(completar)_ | Formularios, pipes, directivas y vistas por rol |

---

## 1. Situación problemática y solución propuesta

La institución gestiona cursos y usuarios de forma manual, sin control de acceso a las
funcionalidades y con la información repartida en varias plataformas. La propuesta es una
aplicación de página única (SPA) desarrollada en Angular que centraliza la gestión y
restringe cada funcionalidad según el rol de quien inicia sesión.

Perfiles atendidos, según el modelo de datos entregado:

| Rol | Alcance |
|---|---|
| Administrador | Crear, consultar, actualizar y eliminar (C/R/A/E) usuarios, cursos y notas |
| Docente | Consultar sus cursos, consultar alumnos y C/R/A/E de notas (máximo 3 evaluaciones por curso, con promedio ponderado) |
| Alumno | Consultar sus cursos y consultar sus notas |

Entidades del modelo utilizadas en este avance: `usuario`, `rol`, `docente`, `alumno`,
`seccion`, `curso`, `asignacion_curso`, `matricula` y `nota_curso`.

---

## 2. Arquitectura de la aplicación

Proyecto Angular 19 con componentes standalone, organizado en tres capas:

- **core** — modelos de dominio (clases), servicios HTTP, guards, interceptores, pipes y
  directivas propias. Es la capa que no depende de ninguna vista.
- **layout** — el shell de la aplicación: menú lateral que se arma dinámicamente según el
  rol del usuario en sesión y `router-outlet` de las rutas protegidas.
- **features** — un módulo funcional por rol (`admin`, `docente`, `alumno`), más `auth` y
  `shared`. Cada módulo se carga de forma diferida.

### Programación orientada a objetos

- Cada entidad es una **clase** con estado y comportamiento propio: `Usuario.nombreCompleto`,
  `Curso.estaActivo()`, `NotaCurso.puntajePonderado()`, `NotaCurso.promedio()`,
  `UsuarioAutenticado.rutaInicio()`.
- Los servicios REST **heredan** de la clase abstracta `BaseHttpService<T>`, que centraliza
  la lógica HTTP con genéricos. Cada servicio concreto solo declara su recurso y cómo mapea
  el DTO a su modelo:

```ts
@Injectable({ providedIn: 'root' })
export class CursoService extends BaseHttpService<Curso> {
  protected readonly recurso = 'cursos';
  protected mapear(dato: CursoDTO): Curso {
    return Curso.desdeDTO(dato);
  }
}
```

### Pipes y directivas de creación propia

| Elemento | Archivo | Función |
|---|---|---|
| `estado` (pipe) | `core/pipes/estado.pipe.ts` | Traduce el `TINYINT` de la base de datos a "Activo" / "Inactivo" |
| `promedio` (pipe) | `core/pipes/promedio.pipe.ts` | Calcula el promedio ponderado de un arreglo de notas |
| `appResaltarNota` | `core/directives/resaltar-nota.directive.ts` | Colorea la calificación según su rango |
| `appSoloNumeros` | `core/directives/solo-numeros.directive.ts` | Restringe a dígitos los campos de DNI y teléfono |

---

## 3. Rutas y flujo de navegación

Las rutas se declaran en `app.routes.ts` y cada módulo funcional aporta sus rutas hijas
mediante `loadChildren` (lazy loading). El árbol completo:

| Ruta | Tipo | Protección | Carga |
|---|---|---|---|
| `/login` | pública | `loginGuard` | `loadComponent` |
| `/admin/usuarios` | privada | `authGuard` + `roleGuard` (ADMIN) | `loadChildren` |
| `/admin/usuarios/nuevo` | privada | hereda de la ruta padre | componente del módulo |
| `/admin/usuarios/:id/editar` | privada, parametrizada | hereda de la ruta padre | componente del módulo |
| `/admin/cursos`, `/cursos/nuevo`, `/cursos/:id/editar` | privadas | hereda de la ruta padre | componentes del módulo |
| `/admin/alumnos` | privada | hereda de la ruta padre | componente compartido |
| `/admin/notas` y `/admin/notas/:idCurso` | privada, parametrizada | hereda de la ruta padre | componente compartido |
| `/docente/cursos` | privada | `authGuard` + `roleGuard` (DOCENTE) | `loadChildren` |
| `/docente/cursos/:idCurso/notas` | privada, parametrizada | hereda de la ruta padre | componente compartido |
| `/docente/alumnos` | privada | hereda de la ruta padre | componente compartido |
| `/alumno/cursos` | privada | `authGuard` + `roleGuard` (ALUMNO) | `loadChildren` |
| `/alumno/notas` | privada | hereda de la ruta padre | componente del módulo |
| `/acceso-denegado` | pública | — | `loadComponent` |
| `**` | comodín 404 | — | `loadComponent` |

Decisiones de diseño:

- Las rutas privadas cuelgan de una **ruta padre sin path** que carga el `ShellComponent`.
  Así el menú lateral y la validación de sesión se aplican una sola vez a todas las vistas
  internas (rutas anidadas).
- `withComponentInputBinding()` permite que los parámetros de ruta lleguen al componente
  como *inputs* (por ejemplo `idCurso` en el registro de notas).
- El destino después del login lo decide el modelo: `UsuarioAutenticado.rutaInicio()`
  devuelve `/admin/usuarios`, `/docente/cursos` o `/alumno/cursos` según el rol. Esa es la
  carga dinámica de componentes por tipo de usuario.
- Toda ruta no reconocida cae en el comodín `**` y muestra la pantalla 404.

---

## 4. Guards implementados

Los tres guards son funcionales (`CanActivateFn`) y usan `inject()`.

**`authGuard`** — protege las rutas privadas. Si no hay token vigente redirige a `/login`
conservando el destino en `redirectTo`, de modo que al ingresar el usuario vuelve a la
página que intentó abrir.

```ts
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaAutenticado()) return true;
  return router.createUrlTree(['/login'], { queryParams: { redirectTo: estado.url } });
};
```

**`roleGuard`** — autoriza según el rol declarado en `data.roles` de la ruta. Si el rol no
coincide, redirige a `/acceso-denegado`.

```ts
{ path: 'admin', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadChildren: ... }
```

**`loginGuard`** — impide volver al login con la sesión abierta: reenvía al inicio que
corresponde al rol.

---

## 5. Base de datos

Se implementó el modelo entidad-relación entregado por el equipo en MySQL/MariaDB
(`database/schema.sql`), con 9 tablas: `rol`, `usuario`, `docente`, `alumno`, `seccion`,
`curso`, `asignacion_curso`, `matricula` y `nota_curso`. Se mantuvieron los nombres de
columnas y tipos de dato del diagrama original.

### Mejoras agregadas sobre el modelo

| Mejora | Dónde | Por qué |
|---|---|---|
| `email` y `dni` únicos en `usuario` | `usuario` | Evita cuentas duplicadas |
| `id_usuario` único en `docente` y `alumno` | `docente`, `alumno` | La relación con `usuario` es 1 a 1 en el diagrama; sin esta restricción, la base de datos permitía violarla |
| `CHECK` de calificación (0–20) y ponderación (1–100) | `nota_curso` | Coincide con la escala vigesimal y el formulario de Angular |
| Trigger `trg_nota_curso_maximo` | `nota_curso` | Refuerza en la base de datos la regla de "máximo 3 evaluaciones", que hasta este avance solo vivía en la API |
| Unicidad en `matricula` (alumno, sección) y `asignacion_curso` (docente, curso) | ambas | Evita matrículas y asignaciones repetidas |
| Llaves foráneas `ON DELETE RESTRICT` en las relaciones críticas | varias | No se puede borrar, por ejemplo, un curso que ya tiene notas registradas |

### Datos semilla

Se cargaron datos de prueba realistas: 17 usuarios (2 administradores, 5 docentes, 10
alumnos), 5 fichas de docente, 10 fichas de alumno, 10 secciones repartidas en dos
periodos académicos, 10 cursos, 10 asignaciones de docente a curso, 14 matrículas (activas
e historial cerrado) y 17 evaluaciones registradas. La tabla `rol` se dejó en sus 3 valores
naturales (ADMIN, DOCENTE, ALUMNO): es un catálogo cerrado y no correspondía inventar más
filas ahí.

Las contraseñas de prueba (`123456` para todas las cuentas) se guardan como hash `bcrypt`
en la columna `password_hash`, nunca en texto plano.

### Verificación de las reglas a nivel de base de datos

```sql
-- Un alumno que ya tiene 3 evaluaciones en un curso:
INSERT INTO nota_curso (id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion)
VALUES (1, 1, 'Extra', 10, 10);
-- ERROR 1644 (45000): Solo se permiten 3 evaluaciones por alumno y curso.

-- Una calificacion fuera de la escala vigesimal:
INSERT INTO nota_curso (id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion)
VALUES (2, 5, 'Nota invalida', 25, 20);
-- ERROR 4025 (23000): CONSTRAINT `chk_nota_calificacion` failed
```

## 6. Servicios REST integrados

`provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor]))` registra el
cliente HTTP y los dos interceptores. La lógica HTTP está centralizada en
`BaseHttpService<T>`, que expone `listar()`, `obtener()`, `crear()`, `actualizar()` y
`eliminar()` como `Observable`, construye los `HttpParams` de los filtros, mapea cada
respuesta a su clase de dominio y traduce los errores con `catchError` y `throwError`.

| Servicio | Recurso | Operaciones |
|---|---|---|
| `UsuarioService` | `/api/usuarios` | GET, GET/:id, POST, PUT, DELETE |
| `CursoService` | `/api/cursos` | GET, GET/:id, POST, PUT, DELETE, `listarPorDocente()`, `listarPorAlumno()` |
| `AlumnoService` | `/api/alumnos` | GET, GET/:id, `listarPorCurso()` |
| `NotaService` | `/api/notas` | GET, POST, PUT, DELETE, `listarPorCurso()`, `listarMisNotas()` |
| `AuthService` | `/api/auth/login` | POST del login y manejo de la sesión |

La API (`mock-api/`) está construida con Express, `jsonwebtoken` y `mysql2/promise` contra
la base de datos descrita en la sección 5. Firma tokens reales, valida el rol en cada
endpoint, traduce las consultas en SQL parametrizado (nunca concatenado, para evitar
inyección SQL) y aplica la regla de máximo tres evaluaciones por alumno y curso tanto en
el código de la API como en el trigger de la base de datos.

---

## 7. Autenticación con token JWT

1. El login envía las credenciales a `POST /api/auth/login` y la API responde con el token
   y los datos del usuario.
2. `AuthService` guarda el token en `localStorage` y expone la sesión mediante *signals*
   (`usuario`, `autenticado`), de modo que el menú lateral reacciona al estado sin
   suscripciones manuales.
3. El **`jwtInterceptor`** agrega `Authorization: Bearer <token>` a toda petición saliente,
   salvo la del propio login.
4. `estaAutenticado()` decodifica el *payload* y compara `exp` con la hora actual: si el
   token venció, limpia la sesión antes de responder.
5. El **`errorInterceptor`** controla los errores de autenticación de forma global: ante un
   401 cierra la sesión y redirige a `/login?expirado=1`; ante un 403 lleva a
   `/acceso-denegado`.

---

## 8. Resultados de pruebas funcionales

Pruebas ejecutadas contra la API ya conectada a MySQL/MariaDB, con `curl` (ver capturas
del navegador en la sustentación).

| # | Caso | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| 1 | Login con contraseña correcta (verificada con `bcrypt.compare`) | Token JWT | Token emitido ✔ |
| 2 | Login con contraseña incorrecta | Rechazo 401 | "Correo o contrasena incorrectos." ✔ |
| 3 | Login con una cuenta inactiva (`estado = 0`) | Rechazo 403 | "La cuenta esta inactiva." ✔ |
| 4 | Login como admin y listar usuarios | Lista completa | 17 registros ✔ |
| 5 | Docente solicita `/api/usuarios` | Rechazo 403 | "Tu rol no tiene permiso sobre este recurso." ✔ |
| 6 | Cursos del docente en sesión (JOIN con `asignacion_curso`) | Solo sus cursos asignados | 3 cursos, incluido uno de un periodo anterior ✔ |
| 7 | Cursos del alumno en sesión (JOIN con `matricula`) | Solo cursos de su sección matriculada | Desarrollo de Interfaces 3, Base de Datos 2 ✔ |
| 8 | Alumnos del curso 1 (JOIN con `matricula`) | Solo matriculados en esa sección | 4 alumnos ✔ |
| 9 | Alumno consulta `/api/notas` | Solo sus propias notas | 5 notas propias, en 2 cursos ✔ |
| 10 | Docente intenta una 4ta evaluación (trigger `trg_nota_curso_maximo`) | Rechazo por regla de negocio | "Solo se permiten 3 evaluaciones por alumno y curso." ✔ |
| 11 | Nota con calificación fuera de rango (`CHECK`) | Rechazo | "La calificacion o la ponderacion estan fuera del rango permitido." ✔ |
| 12 | Admin registra un usuario con correo repetido (llave única) | Rechazo | "El registro ya existe (dato duplicado)." ✔ |
| 13 | Admin registra un usuario nuevo | Usuario creado, contraseña hasheada | id_usuario 19, rol DOCENTE ✔ |
| 14 | Login con la contraseña recién creada | Verifica el hash guardado | Ingreso correcto ✔ |
| 15 | Admin elimina un curso con notas asociadas (llave foránea `RESTRICT`) | Rechazo | "No se puede eliminar: el registro tiene datos relacionados." ✔ |
| 16 | Petición sin token | Rechazo 401 | "Falta el token de acceso." ✔ |
| 17 | Recurso inexistente | Respuesta 404 controlada | "Recurso no disponible." ✔ |

Pruebas de navegación a verificar en la sustentación:

- Abrir `/admin/usuarios` sin sesión redirige a `/login?redirectTo=/admin/usuarios` y, tras
  ingresar, entra directo a esa vista.
- Un alumno que escribe `/admin/usuarios` en la barra de direcciones cae en
  `/acceso-denegado`.
- Con sesión abierta, escribir `/login` reenvía al inicio del rol.
- Una ruta inventada (`/reportes`) muestra la pantalla 404.
- La pestaña **Network** confirma la cabecera `Authorization: Bearer ...` en cada petición y
  la carga diferida del *chunk* del módulo al entrar por primera vez a cada sección.

---

## 9. Cobertura de la rúbrica en este avance

| Criterio | Evidencia en el código |
|---|---|
| Buenas prácticas y POO | Clases de dominio con comportamiento, `BaseHttpService<T>` como clase abstracta genérica, separación core/layout/features, dos pipes y dos directivas propias |
| Implementación de rutas | Rutas anidadas bajo el shell, parámetros dinámicos (`:id`, `:idCurso`), lazy loading por rol, redirecciones y comodín 404 |
| Implementación de guards | `authGuard`, `roleGuard` y `loginGuard`, con redirección automática y retorno al destino original |
| Integración con API REST | GET, POST, PUT y DELETE desde servicios por entidad, lógica HTTP centralizada, manejo de errores con `HttpInterceptor` y `catchError`, flujo con `Observable` |
| Autenticación JWT | Token en `localStorage`, `HttpInterceptor` que lo inserta en cada petición, control de expiración y de errores 401/403 de forma global, contraseñas verificadas con `bcrypt` contra `password_hash` |
| Base de datos | Modelo del diagrama implementado en MySQL/MariaDB con llaves foráneas, restricciones `CHECK`, un trigger que refuerza el máximo de 3 evaluaciones, y 96 registros de datos semilla en total |

## 10. Pendientes para la entrega final

- Formulario de alta y edición de alumnos desde el panel de administración.
- Búsqueda y paginación en las tablas de usuarios y cursos.
- Renovación de token y aviso previo al vencimiento de la sesión.
- Pruebas unitarias de guards y servicios con Jasmine/Karma.
- Despliegue del frontend y publicación de la API en un entorno accesible.
