-- =====================================================================
-- Gestion Academica - Esquema de base de datos (MySQL / MariaDB)
-- Basado en el modelo entidad-relacion entregado por el equipo.
-- Motor: InnoDB (necesario para llaves foraneas) | Charset: utf8mb4
-- =====================================================================
-- Tablas del diagrama original: rol, usuario, docente, alumno, seccion,
-- curso, asignacion_curso, matricula, nota_curso.
-- Se respetan los nombres de columnas y tipos de dato del diagrama.
-- Las mejoras agregadas sobre el modelo original estan comentadas con
-- "MEJORA:" en cada punto, para poder explicarlas en la sustentacion.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gestion_academica
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gestion_academica;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS nota_curso;
DROP TABLE IF EXISTS asignacion_curso;
DROP TABLE IF EXISTS matricula;
DROP TABLE IF EXISTS curso;
DROP TABLE IF EXISTS seccion;
DROP TABLE IF EXISTS alumno;
DROP TABLE IF EXISTS docente;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- rol : catalogo de roles del sistema (ADMIN, DOCENTE, ALUMNO)
-- ---------------------------------------------------------------------
CREATE TABLE rol (
  id_rol      INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol  VARCHAR(50)  NOT NULL,
  descripcion TEXT,
  -- MEJORA: nombre_rol unico para no crear roles duplicados por error.
  CONSTRAINT uq_rol_nombre UNIQUE (nombre_rol)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- usuario : cuenta de acceso de cualquier persona del sistema
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
  id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
  dni            VARCHAR(8)   NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  apellido       VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  estado         TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_rol         INT          NOT NULL,
  -- MEJORA: dni y email unicos; evita cuentas duplicadas.
  CONSTRAINT uq_usuario_dni   UNIQUE (dni),
  CONSTRAINT uq_usuario_email UNIQUE (email),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_usuario_rol (id_rol)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- docente : datos adicionales de un usuario con rol DOCENTE (1 a 1)
-- ---------------------------------------------------------------------
CREATE TABLE docente (
  id_docente      INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  especialidad    VARCHAR(150),
  grado_academico VARCHAR(100),
  telefono        VARCHAR(20),
  -- MEJORA: id_usuario unico para que la relacion 1 a 1 con usuario
  -- se cumpla de verdad (un usuario no puede tener dos fichas docente).
  CONSTRAINT uq_docente_usuario UNIQUE (id_usuario),
  CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- alumno : datos adicionales de un usuario con rol ALUMNO (1 a 1)
-- ---------------------------------------------------------------------
CREATE TABLE alumno (
  id_alumno        INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT NOT NULL,
  dni_apoderado    VARCHAR(8),
  telefono         VARCHAR(20),
  fecha_nacimiento DATE,
  CONSTRAINT uq_alumno_usuario UNIQUE (id_usuario),
  CONSTRAINT fk_alumno_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- seccion : grupo/periodo en el que se dictan los cursos
-- ---------------------------------------------------------------------
CREATE TABLE seccion (
  id_seccion        INT AUTO_INCREMENT PRIMARY KEY,
  nombre_seccion    VARCHAR(50) NOT NULL,
  periodo_academico VARCHAR(20) NOT NULL,
  capacidad_maxima  INT NOT NULL DEFAULT 30,
  estado            TINYINT(1)  NOT NULL DEFAULT 1,
  -- MEJORA: no puede repetirse la misma seccion en el mismo periodo.
  CONSTRAINT uq_seccion_periodo UNIQUE (nombre_seccion, periodo_academico)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- curso : curso dictado dentro de una seccion
-- ---------------------------------------------------------------------
CREATE TABLE curso (
  id_curso       INT AUTO_INCREMENT PRIMARY KEY,
  id_seccion     INT NOT NULL,
  nombre         VARCHAR(150) NOT NULL,
  descripcion    TEXT,
  estado         TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_curso_seccion FOREIGN KEY (id_seccion) REFERENCES seccion (id_seccion)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_curso_seccion (id_seccion)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- asignacion_curso : que docente dicta que curso
-- ---------------------------------------------------------------------
CREATE TABLE asignacion_curso (
  id_asignacion    INT AUTO_INCREMENT PRIMARY KEY,
  id_docente       INT NOT NULL,
  id_curso         INT NOT NULL,
  estado           TINYINT(1) NOT NULL DEFAULT 1,
  fecha_asignacion TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- MEJORA: un docente no puede quedar asignado dos veces al mismo curso.
  CONSTRAINT uq_asignacion UNIQUE (id_docente, id_curso),
  CONSTRAINT fk_asignacion_docente FOREIGN KEY (id_docente) REFERENCES docente (id_docente)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_asignacion_curso FOREIGN KEY (id_curso) REFERENCES curso (id_curso)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_asignacion_docente (id_docente),
  INDEX idx_asignacion_curso (id_curso)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- matricula : inscripcion de un alumno en una seccion
-- ---------------------------------------------------------------------
CREATE TABLE matricula (
  id_matricula    INT AUTO_INCREMENT PRIMARY KEY,
  id_alumno       INT  NOT NULL,
  id_seccion      INT  NOT NULL,
  fecha_matricula DATE NOT NULL,
  estado          TINYINT(1) NOT NULL DEFAULT 1,
  -- MEJORA: un alumno no puede matricularse dos veces en la misma seccion.
  CONSTRAINT uq_matricula UNIQUE (id_alumno, id_seccion),
  CONSTRAINT fk_matricula_alumno FOREIGN KEY (id_alumno) REFERENCES alumno (id_alumno)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_matricula_seccion FOREIGN KEY (id_seccion) REFERENCES seccion (id_seccion)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_matricula_alumno (id_alumno),
  INDEX idx_matricula_seccion (id_seccion)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- nota_curso : evaluaciones de un alumno en un curso (maximo 3, C/R/A/E
-- del docente segun la rubrica, con promedio ponderado)
-- ---------------------------------------------------------------------
CREATE TABLE nota_curso (
  id_nota           INT AUTO_INCREMENT PRIMARY KEY,
  id_curso          INT NOT NULL,
  id_alumno         INT NOT NULL,
  nombre_evaluacion VARCHAR(100)  NOT NULL,
  calificacion      DECIMAL(5,2)  NOT NULL,
  ponderacion       DECIMAL(5,2)  NOT NULL,
  fecha_registro    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_nota_curso   FOREIGN KEY (id_curso)  REFERENCES curso  (id_curso)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_nota_alumno  FOREIGN KEY (id_alumno) REFERENCES alumno (id_alumno)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  -- MEJORA: la calificacion respeta la escala vigesimal (0 a 20) y la
  -- ponderacion se expresa como porcentaje (1 a 100), tal como las usa
  -- el formulario de Angular.
  CONSTRAINT chk_nota_calificacion CHECK (calificacion BETWEEN 0 AND 20),
  CONSTRAINT chk_nota_ponderacion  CHECK (ponderacion  BETWEEN 1 AND 100),
  INDEX idx_nota_curso_alumno (id_curso, id_alumno)
) ENGINE = InnoDB;

-- =====================================================================
-- MEJORA: regla de negocio "maximo 3 evaluaciones por alumno y curso"
-- reforzada tambien a nivel de base de datos (no solo en la API), con
-- un trigger que rechaza la cuarta evaluacion antes de insertarla.
-- =====================================================================
DELIMITER $$

CREATE TRIGGER trg_nota_curso_maximo
BEFORE INSERT ON nota_curso
FOR EACH ROW
BEGIN
  DECLARE total_notas INT;
  SELECT COUNT(*) INTO total_notas
    FROM nota_curso
   WHERE id_curso = NEW.id_curso
     AND id_alumno = NEW.id_alumno;
  IF total_notas >= 3 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Solo se permiten 3 evaluaciones por alumno y curso.';
  END IF;
END$$

DELIMITER ;
