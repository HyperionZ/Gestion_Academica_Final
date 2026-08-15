# Sistema de Gestión Académica — SPA en Angular

Avance preliminar del proyecto de la evaluación final de **Desarrollo de Interfaces 3**.
Aplicación de página única (SPA) que centraliza la gestión de usuarios, cursos y notas de una
institución educativa, con autenticación JWT y navegación protegida por guards.

## Integrantes

| Nombre | Rol en el equipo |
|---|---|
| _(completar)_ | Rutas y guards |
| _(completar)_ | Servicios REST e interceptores |
| _(completar)_ | Componentes y formularios |

## Requisitos

- Node.js 20 o superior ([descargar el instalador](https://nodejs.org), doble clic para instalar, sin usar consola)
- MySQL o MariaDB con MySQL Workbench (o phpMyAdmin, XAMPP, etc.)

## Ejecutar sin usar la consola (Windows)

Si no quieres escribir comandos, usa los tres archivos `.bat` de esta misma carpeta,
en este orden. Cada uno se abre con doble clic y muestra una ventana negra con el
progreso, pero no necesitas escribir nada en ella (salvo la primera vez, que se abre
el Bloc de notas para que revises la conexión a tu base de datos).

1. **`1-preparar-base-de-datos.bat`** — instala las dependencias de la API y crea la
   base de datos `gestion_academica` con los datos de prueba. La primera vez que lo
   ejecutes se abrirá `mock-api\.env` en el Bloc de notas: ajusta `DB_ADMIN_USER` y
   `DB_ADMIN_PASSWORD` con el usuario y la contraseña de tu MySQL, guarda, cierra el
   Bloc de notas y vuelve a hacer doble clic en el mismo `.bat`.
2. **`2-iniciar-api.bat`** — deja la API corriendo en `http://localhost:3000`. Déjala
   abierta mientras uses la aplicación.
3. **`3-iniciar-frontend.bat`** — instala Angular (la primera vez tarda varios
   minutos) y abre la aplicación en `http://localhost:4200`.

**Alternativa 100% con clics para la base de datos, usando MySQL Workbench:**
en vez del paso 1, abre Workbench, conéctate a tu servidor, ve a `File → Open SQL
Script...`, elige `database/schema.sql` y haz clic en el ícono del rayo ⚡ para
ejecutarlo. Repite lo mismo con `database/seed.sql`. Después edita `mock-api/.env` a
mano con el Bloc de notas (copiando `mock-api/.env.example`) y sigue directo con los
pasos 2 y 3.

## Instalación y ejecución (con consola)

El repositorio tiene tres carpetas: la base de datos, la API y el frontend. Se levantan
en ese orden.

### 1) Base de datos (MySQL o MariaDB)

Necesitas un servidor MySQL o MariaDB corriendo en tu máquina (por ejemplo, instalado con
XAMPP, WAMP, o `apt install mariadb-server`).

**Opción A — con el cliente `mysql`:**

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

**Opción B — desde Node, sin salir del proyecto:**

```bash
cd mock-api
npm install
npm run db:init
```

Ambas opciones crean la base de datos `gestion_academica`, las 9 tablas, el usuario de
aplicación `idat_app` y cargan los datos de prueba. `npm run db:init` necesita un usuario
con privilegios de administrador (ver `DB_ADMIN_USER` en `mock-api/.env.example`); si tu
`root` de MySQL solo autentica por socket, crea un usuario aparte como se explica en ese
archivo.

### 2) API REST (puerto 3000)

```bash
cd mock-api
cp .env.example .env      # ajusta las credenciales si las cambiaste
npm install
npm start
```

Queda disponible en `http://localhost:3000/api`. Emite tokens JWT reales, valida el rol
en cada endpoint y lee/escribe directamente en `gestion_academica` a través de `mysql2`.
Los datos ahora persisten en la base de datos: sobreviven a un reinicio del servidor.

### 3) Frontend Angular (puerto 4200)

```bash
cd frontend
npm install
npm start
```

Abre `http://localhost:4200`. La URL de la API se configura en
`src/environments/environment.ts`.

## Cuentas de prueba

| Correo | Contraseña | Rol | Qué puede hacer |
|---|---|---|---|
| admin@idat.edu.pe | 123456 | ADMIN | Crear, consultar, actualizar y eliminar usuarios, cursos y notas |
| docente@idat.edu.pe | 123456 | DOCENTE | Consultar sus cursos y alumnos; registrar notas (máx. 3 por curso) |
| alumno@idat.edu.pe | 123456 | ALUMNO | Consultar sus cursos y sus notas con el promedio ponderado |

## Estructura del proyecto

```
database/
├── schema.sql                 Tablas, llaves foráneas, restricciones y el trigger
│                               que limita a 3 evaluaciones por alumno y curso
└── seed.sql                   Datos de prueba (ver conteos más abajo)

mock-api/
├── db.js                      Pool de conexiones a MySQL (mysql2/promise)
├── init-db.js                 Alternativa a los .sql: crea todo desde Node
├── server.js                  Endpoints REST, ahora con SELECT/INSERT/UPDATE/DELETE reales
└── .env.example                Variables de conexión (copiar como .env)

frontend/src/app
├── app.routes.ts              Rutas raíz: pública, protegidas y comodín 404
├── app.config.ts              provideRouter + provideHttpClient con interceptores
├── core
│   ├── models                 Clases de dominio (Usuario, Curso, Alumno, NotaCurso)
│   ├── services               AuthService y servicios REST que heredan de BaseHttpService
│   ├── guards                 authGuard, roleGuard, loginGuard
│   ├── interceptors           jwtInterceptor, errorInterceptor
│   ├── pipes                  estado, promedio (pipes propios)
│   └── directives             appResaltarNota, appSoloNumeros (directivas propias)
├── layout                     Shell con menú lateral según el rol
└── features
    ├── auth                   Login con formulario reactivo
    ├── admin                  Módulo lazy: usuarios, cursos, alumnos, notas
    ├── docente                Módulo lazy: mis cursos, alumnos, registro de notas
    ├── alumno                 Módulo lazy: mis cursos, mis notas
    └── shared                 Notas por curso, lista de alumnos, 403 y 404
```

## Base de datos

El modelo sigue el diagrama entidad-relación entregado por el equipo (`rol`, `usuario`,
`docente`, `alumno`, `seccion`, `curso`, `asignacion_curso`, `matricula`, `nota_curso`),
con estas mejoras agregadas y documentadas en `database/schema.sql`:

- `email` y `dni` únicos en `usuario`; `id_usuario` único en `docente` y `alumno` para que
  la relación 1 a 1 con el diagrama se cumpla de verdad.
- Restricciones `CHECK` en `nota_curso`: calificación entre 0 y 20, ponderación entre 1 y 100.
- Un **trigger** (`trg_nota_curso_maximo`) que rechaza la cuarta evaluación de un alumno en
  un curso directamente en la base de datos, además de la validación que ya hacía la API.
- Restricciones de unicidad en `matricula` y `asignacion_curso` para evitar registros
  duplicados (un alumno no puede matricularse dos veces en la misma sección, un docente no
  puede quedar asignado dos veces al mismo curso).
- Llaves foráneas `ON DELETE RESTRICT` en las relaciones críticas (por ejemplo, no se puede
  eliminar un curso que ya tiene notas registradas), y `ON DELETE CASCADE` de `usuario` hacia
  `docente`/`alumno`, ya que esas filas no existen sin su usuario.

### Datos semilla

| Tabla | Registros | Nota |
|---|---|---|
| `rol` | 3 | Catálogo cerrado (ADMIN, DOCENTE, ALUMNO); no se rellena con roles inventados |
| `usuario` | 17 | 2 administradores, 5 docentes, 10 alumnos |
| `docente` | 5 | Uno por cada usuario con rol DOCENTE |
| `alumno` | 10 | Uno por cada usuario con rol ALUMNO |
| `seccion` | 10 | 5 secciones activas (2026-I) + 5 del periodo anterior (2025-II) |
| `curso` | 10 | Repartidos entre las secciones |
| `asignacion_curso` | 10 | Qué docente dicta qué curso |
| `matricula` | 14 | Matrículas activas del periodo actual + historial cerrado |
| `nota_curso` | 17 | Evaluaciones en progreso, ninguna pasa de 3 por alumno y curso |

Todas las cuentas de prueba usan la contraseña `123456`, guardada como hash `bcrypt`
(columna `password_hash`), nunca en texto plano.

## Endpoints de la API

| Método | Ruta | Roles |
|---|---|---|
| POST | `/api/auth/login` | público |
| GET | `/api/auth/perfil` | autenticado |
| GET POST PUT DELETE | `/api/usuarios` | ADMIN |
| GET | `/api/cursos?docente=&alumno=` | autenticado |
| POST PUT DELETE | `/api/cursos` | ADMIN |
| GET | `/api/alumnos?curso=` | ADMIN, DOCENTE |
| GET | `/api/notas?curso=&alumno=` | autenticado (el alumno solo ve las suyas) |
| POST PUT DELETE | `/api/notas` | ADMIN, DOCENTE |

## Estado del avance

Implementado: base de datos MySQL/MariaDB con el modelo del diagrama, login con JWT y
contraseñas con `bcrypt`, guards de autenticación y rol, lazy loading por módulo, CRUD de
usuarios y cursos, registro de notas con tope de 3 evaluaciones reforzado también por un
trigger de base de datos, promedio ponderado, consultas de docente y alumno, pipes y
directivas propias, interceptores de token y de errores.

Pendiente para la entrega final: formulario de alumnos desde el panel de administración,
paginación y búsqueda en las tablas, refresco de token y pruebas unitarias.
