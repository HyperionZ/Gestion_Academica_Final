-- =====================================================================
-- Gestion Academica - Datos semilla
-- Contrasena de todas las cuentas de prueba: 123456
-- (el hash de abajo es un bcrypt real de "123456", con costo 10)
-- =====================================================================
USE gestion_academica;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE nota_curso;
TRUNCATE TABLE asignacion_curso;
TRUNCATE TABLE matricula;
TRUNCATE TABLE curso;
TRUNCATE TABLE seccion;
TRUNCATE TABLE alumno;
TRUNCATE TABLE docente;
TRUNCATE TABLE usuario;
TRUNCATE TABLE rol;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- rol (3 registros: es un catalogo cerrado, no tiene sentido "rellenar"
-- hasta 10 filas con roles que la aplicacion no usa).
-- ---------------------------------------------------------------------
INSERT INTO rol (id_rol, nombre_rol, descripcion) VALUES
  (1, 'ADMIN',   'Administra usuarios, cursos y notas'),
  (2, 'DOCENTE', 'Consulta cursos y alumnos; registra notas'),
  (3, 'ALUMNO',  'Consulta sus cursos y sus notas');

-- ---------------------------------------------------------------------
-- usuario (17 registros: 2 admin, 5 docentes, 10 alumnos)
-- ---------------------------------------------------------------------
INSERT INTO usuario
  (id_usuario, dni, nombre, apellido, email, password_hash, estado, id_rol) VALUES
  (1,  '70123456', 'Lucia',     'Ramos',       'admin@idat.edu.pe',    '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 1),
  (2,  '70654321', 'Roberto',   'Aguilar',     'admin2@idat.edu.pe',   '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 1),
  (3,  '41258963', 'Carlos',    'Mendoza',     'docente@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 2),
  (4,  '43871200', 'Ana',       'Quispe',      'docente2@idat.edu.pe', '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 2),
  (5,  '44519087', 'Fernando',  'Castillo',    'docente3@idat.edu.pe', '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 2),
  (6,  '42367810', 'Patricia',  'Nunez',       'docente4@idat.edu.pe', '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 2),
  (7,  '45782103', 'Miguel',    'Rojas',       'docente5@idat.edu.pe', '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 2),
  (8,  '76543210', 'Diego',     'Torres',      'alumno@idat.edu.pe',   '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (9,  '75319864', 'Mariana',   'Flores',      'alumno2@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (10, '77412589', 'Jorge',     'Salas',       'alumno3@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 0, 3),
  (11, '78945612', 'Valeria',   'Chumpitaz',   'alumno4@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (12, '79632158', 'Andres',    'Paredes',     'alumno5@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (13, '71234598', 'Camila',    'Rios',        'alumno6@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (14, '73698521', 'Sebastian', 'Vargas',      'alumno7@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (15, '74561238', 'Daniela',   'Huaman',      'alumno8@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (16, '72589634', 'Gabriel',   'Espinoza',    'alumno9@idat.edu.pe',  '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3),
  (17, '70981245', 'Ximena',    'Cardenas',    'alumno10@idat.edu.pe', '$2b$10$zPnbg2Tr/SP1jOHpA2LAoejZkuNjoL7ETb.FTI0FIb1y6/Dw1mYx2', 1, 3);

-- ---------------------------------------------------------------------
-- docente (5 registros: es 1 a 1 con usuarios de rol DOCENTE, que son
-- solo 5 en esta semilla; no corresponde inventar mas).
-- ---------------------------------------------------------------------
INSERT INTO docente (id_docente, id_usuario, especialidad, grado_academico, telefono) VALUES
  (1, 3, 'Desarrollo web',             'Ingeniero de Sistemas',                '987654321'),
  (2, 4, 'Base de datos',              'Magister en Tecnologias de Informacion','912345678'),
  (3, 5, 'Redes y ciberseguridad',     'Ingeniero Informatico',                '934567123'),
  (4, 6, 'Programacion movil',         'Magister en Ingenieria de Software',   '956781234'),
  (5, 7, 'Arquitectura de software',   'Ingeniero de Sistemas',                '978123456');

-- ---------------------------------------------------------------------
-- alumno (10 registros)
-- ---------------------------------------------------------------------
INSERT INTO alumno (id_alumno, id_usuario, dni_apoderado, telefono, fecha_nacimiento) VALUES
  (1,  8,  '09876543', '965321478', '2004-05-14'),
  (2,  9,  '08123456', '951753486', '2005-11-02'),
  (3,  10, '07654321', '934567812', '2003-02-28'),
  (4,  11, '07123456', '941236789', '2004-08-19'),
  (5,  12, '06987456', '923456781', '2004-01-30'),
  (6,  13, '06456789', '987123465', '2005-03-11'),
  (7,  14, '05678912', '912378456', '2003-09-25'),
  (8,  15, '05321789', '998765432', '2004-12-07'),
  (9,  16, '04987321', '976543210', '2005-06-16'),
  (10, 17, '04567123', '965874123', '2004-04-22');

-- ---------------------------------------------------------------------
-- seccion (10 registros: 5 grupos activos del periodo actual 2026-I y
-- 5 del periodo previo 2025-II, para mostrar historial de matricula).
-- ---------------------------------------------------------------------
INSERT INTO seccion (id_seccion, nombre_seccion, periodo_academico, capacidad_maxima, estado) VALUES
  (1,  'A', '2026-I',  30, 1),
  (2,  'B', '2026-I',  25, 1),
  (3,  'C', '2026-I',  25, 1),
  (4,  'D', '2026-I',  20, 1),
  (5,  'E', '2026-I',  20, 0),
  (6,  'A', '2025-II', 30, 1),
  (7,  'B', '2025-II', 28, 1),
  (8,  'C', '2025-II', 25, 1),
  (9,  'D', '2025-II', 20, 1),
  (10, 'E', '2025-II', 20, 1);

-- ---------------------------------------------------------------------
-- curso (10 registros)
-- ---------------------------------------------------------------------
INSERT INTO curso (id_curso, id_seccion, nombre, descripcion, estado) VALUES
  (1,  1, 'Desarrollo de Interfaces 3',      'Angular, rutas, guards y consumo de APIs REST',   1),
  (2,  1, 'Base de Datos 2',                 'Modelado relacional y procedimientos almacenados',1),
  (3,  2, 'Programacion Orientada a Objetos','Clases, herencia y patrones de diseno',            1),
  (4,  3, 'Arquitectura de Software',        'Capas, servicios y buenas practicas',              0),
  (5,  2, 'Redes y Comunicaciones',          'Protocolos, direccionamiento IP y seguridad basica',1),
  (6,  4, 'Desarrollo Movil',                'Aplicaciones hibridas y consumo de APIs',          1),
  (7,  6, 'Fundamentos de Programacion',     'Logica, algoritmos y estructuras de control',      1),
  (8,  7, 'Estructura de Datos',             'Listas, pilas, colas y arboles',                   1),
  (9,  8, 'Ingenieria de Software',          'Ciclo de vida y metodologias agiles',              1),
  (10, 9, 'Seguridad Informatica',           'Autenticacion, autorizacion y buenas practicas',   1);

-- ---------------------------------------------------------------------
-- asignacion_curso (10 registros)
-- ---------------------------------------------------------------------
INSERT INTO asignacion_curso (id_asignacion, id_docente, id_curso, estado) VALUES
  (1,  1, 1,  1),
  (2,  1, 3,  1),
  (3,  2, 2,  1),
  (4,  3, 5,  1),
  (5,  4, 6,  1),
  (6,  1, 7,  1),
  (7,  2, 8,  1),
  (8,  5, 9,  1),
  (9,  3, 10, 1),
  (10, 5, 4,  0);

-- ---------------------------------------------------------------------
-- matricula (14 registros: matriculas activas del periodo actual mas
-- historial cerrado del periodo previo).
-- ---------------------------------------------------------------------
INSERT INTO matricula (id_matricula, id_alumno, id_seccion, fecha_matricula, estado) VALUES
  (1,  1, 1, '2026-03-01', 1),
  (2,  2, 1, '2026-03-01', 1),
  (3,  3, 2, '2026-03-02', 1),
  (4,  4, 1, '2026-03-01', 1),
  (5,  5, 2, '2026-03-02', 1),
  (6,  6, 3, '2026-03-03', 1),
  (7,  7, 3, '2026-03-03', 1),
  (8,  8, 4, '2026-03-04', 1),
  (9,  9, 1, '2026-03-01', 1),
  (10, 10,2, '2026-03-02', 1),
  (11, 1, 6, '2025-08-15', 0),
  (12, 2, 7, '2025-08-15', 0),
  (13, 3, 6, '2025-08-15', 0),
  (14, 4, 8, '2025-08-16', 0);

-- ---------------------------------------------------------------------
-- nota_curso (17 registros: progreso real de evaluaciones, sin llegar
-- todos al tope de 3 para reflejar un ciclo en curso).
-- ---------------------------------------------------------------------
INSERT INTO nota_curso (id_nota, id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion) VALUES
  (1,  1, 1, 'Practica calificada 1', 15.00, 20),
  (2,  1, 1, 'Examen parcial',        16.00, 40),
  (3,  1, 1, 'Trabajo final',         18.00, 40),
  (4,  1, 2, 'Practica calificada 1', 12.00, 20),
  (5,  1, 2, 'Examen parcial',        14.00, 40),
  (6,  1, 4, 'Practica calificada 1', 17.00, 20),
  (7,  2, 1, 'Practica calificada 1', 14.00, 30),
  (8,  2, 1, 'Examen parcial',        13.00, 30),
  (9,  2, 2, 'Practica calificada 1', 11.00, 30),
  (10, 3, 3, 'Practica calificada 1', 16.00, 20),
  (11, 3, 3, 'Examen parcial',        15.00, 30),
  (12, 3, 3, 'Trabajo final',         17.00, 50),
  (13, 3, 5, 'Practica calificada 1', 13.00, 20),
  (14, 3, 5, 'Examen parcial',        12.00, 30),
  (15, 3, 10,'Practica calificada 1', 18.00, 20),
  (16, 6, 8, 'Practica calificada 1', 15.00, 25),
  (17, 6, 8, 'Examen parcial',        16.00, 35);

-- Continuar los AUTO_INCREMENT despues de los IDs insertados a mano,
-- para que los registros nuevos desde la aplicacion no choquen.
ALTER TABLE rol               AUTO_INCREMENT = 4;
ALTER TABLE usuario           AUTO_INCREMENT = 18;
ALTER TABLE docente           AUTO_INCREMENT = 6;
ALTER TABLE alumno            AUTO_INCREMENT = 11;
ALTER TABLE seccion           AUTO_INCREMENT = 11;
ALTER TABLE curso             AUTO_INCREMENT = 11;
ALTER TABLE asignacion_curso  AUTO_INCREMENT = 11;
ALTER TABLE matricula         AUTO_INCREMENT = 15;
ALTER TABLE nota_curso        AUTO_INCREMENT = 18;
