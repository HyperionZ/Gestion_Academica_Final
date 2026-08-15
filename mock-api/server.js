/**
 * API REST del proyecto, ahora respaldada por una base de datos real
 * (MySQL/MariaDB, ver database/schema.sql). Firma JWT reales, valida
 * el rol en cada endpoint y aplica las reglas de negocio (maximo 3
 * evaluaciones por alumno y curso) tanto en la API como en la base de
 * datos, mediante el trigger `trg_nota_curso_maximo`.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const SECRETO = process.env.JWT_SECRETO || 'idat-desarrollo-interfaces-3';
const VIGENCIA = process.env.JWT_VIGENCIA || '2h';
const PUERTO = Number(process.env.PUERTO || 3000);

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- utilidades ---------- */

/** Envuelve un handler async para no repetir try/catch en cada ruta. */
const asyncRoute = (handler) => (req, res) => handler(req, res).catch((error) => manejarErrorSql(error, res));

/** Traduce errores tipicos de MySQL a mensajes entendibles para el cliente. */
function manejarErrorSql(error, res) {
  console.error(error.sqlMessage || error.message);

  // Trigger de negocio: maximo 3 evaluaciones por alumno y curso.
  if (error.sqlState === '45000') {
    return res.status(400).json({ mensaje: error.sqlMessage });
  }
  // CHECK constraint (rango de calificacion o ponderacion).
  if (error.errno === 4025) {
    return res.status(400).json({ mensaje: 'La calificacion o la ponderacion estan fuera del rango permitido.' });
  }
  // Llave unica duplicada (email, dni, matricula repetida, etc).
  if (error.errno === 1062) {
    return res.status(400).json({ mensaje: 'El registro ya existe (dato duplicado).' });
  }
  // Borrado bloqueado por llave foranea (tiene registros relacionados).
  if (error.errno === 1451) {
    return res.status(400).json({ mensaje: 'No se puede eliminar: el registro tiene datos relacionados.' });
  }
  return res.status(500).json({ mensaje: 'Error interno del servidor.' });
}

function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;
  if (!token) return res.status(401).json({ mensaje: 'Falta el token de acceso.' });
  try {
    req.usuario = jwt.verify(token, SECRETO);
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token invalido o expirado.' });
  }
}

const autorizar = (...roles) => (req, res, next) =>
  roles.includes(req.usuario.rol)
    ? next()
    : res.status(403).json({ mensaje: 'Tu rol no tiene permiso sobre este recurso.' });

function publico(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    dni: usuario.dni,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    estado: usuario.estado,
    id_rol: usuario.id_rol,
    rol: usuario.rol,
    fecha_creacion: usuario.fecha_creacion,
  };
}

/* ---------- autenticacion ---------- */

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};

  const [filas] = await pool.query(
    `SELECT u.*, r.nombre_rol AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
      WHERE u.email = ?`,
    [email]
  );
  const usuario = filas[0];

  if (!usuario || !(await bcrypt.compare(password || '', usuario.password_hash))) {
    return res.status(401).json({ mensaje: 'Correo o contrasena incorrectos.' });
  }
  if (usuario.estado !== 1) {
    return res.status(403).json({ mensaje: 'La cuenta esta inactiva.' });
  }

  const token = jwt.sign(
    { sub: usuario.id_usuario, email: usuario.email, rol: usuario.rol, nombre: `${usuario.nombre} ${usuario.apellido}` },
    SECRETO,
    { expiresIn: VIGENCIA }
  );

  res.json({ token, usuario: publico(usuario) });
}));

app.get('/api/auth/perfil', autenticar, asyncRoute(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT u.*, r.nombre_rol AS rol FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`,
    [req.usuario.sub]
  );
  if (!filas[0]) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.json(publico(filas[0]));
}));

/* ---------- usuarios (solo ADMIN) ---------- */

app.get('/api/usuarios', autenticar, autorizar('ADMIN'), asyncRoute(async (_req, res) => {
  const [filas] = await pool.query(
    `SELECT u.*, r.nombre_rol AS rol FROM usuario u JOIN rol r ON r.id_rol = u.id_rol ORDER BY u.id_usuario`
  );
  res.json(filas.map(publico));
}));

app.get('/api/usuarios/:id', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT u.*, r.nombre_rol AS rol FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`,
    [req.params.id]
  );
  if (!filas[0]) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.json(publico(filas[0]));
}));

app.post('/api/usuarios', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  const { dni, nombre, apellido, email, rol, estado, password } = req.body;
  if (!dni || !nombre || !email) {
    return res.status(400).json({ mensaje: 'DNI, nombre y correo son obligatorios.' });
  }

  const [[filaRol]] = await pool.query('SELECT id_rol FROM rol WHERE nombre_rol = ?', [rol || 'ALUMNO']);
  const hash = await bcrypt.hash(password || '123456', 10);

  const [resultado] = await pool.query(
    `INSERT INTO usuario (dni, nombre, apellido, email, password_hash, estado, id_rol)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dni, nombre, apellido, email, hash, Number(estado ?? 1), filaRol?.id_rol ?? 3]
  );

  const [filas] = await pool.query(
    `SELECT u.*, r.nombre_rol AS rol FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`,
    [resultado.insertId]
  );
  res.status(201).json(publico(filas[0]));
}));

app.put('/api/usuarios/:id', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  const { dni, nombre, apellido, email, rol, estado } = req.body;

  let idRol = null;
  if (rol) {
    const [[filaRol]] = await pool.query('SELECT id_rol FROM rol WHERE nombre_rol = ?', [rol]);
    idRol = filaRol?.id_rol ?? null;
  }

  const [resultado] = await pool.query(
    `UPDATE usuario SET
       dni = COALESCE(?, dni),
       nombre = COALESCE(?, nombre),
       apellido = COALESCE(?, apellido),
       email = COALESCE(?, email),
       estado = COALESCE(?, estado),
       id_rol = COALESCE(?, id_rol)
     WHERE id_usuario = ?`,
    [dni ?? null, nombre ?? null, apellido ?? null, email ?? null, estado !== undefined ? Number(estado) : null, idRol, req.params.id]
  );
  if (resultado.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

  const [filas] = await pool.query(
    `SELECT u.*, r.nombre_rol AS rol FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`,
    [req.params.id]
  );
  res.json(publico(filas[0]));
}));

app.delete('/api/usuarios/:id', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  const [resultado] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [req.params.id]);
  if (resultado.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.status(204).send();
}));

/* ---------- cursos ---------- */

app.get('/api/cursos', autenticar, asyncRoute(async (req, res) => {
  let sql = `
    SELECT c.*, CONCAT(s.nombre_seccion, ' (', s.periodo_academico, ')') AS nombre_seccion,
           CONCAT(du.nombre, ' ', du.apellido) AS nombre_docente
      FROM curso c
      JOIN seccion s ON s.id_seccion = c.id_seccion
      LEFT JOIN asignacion_curso ac ON ac.id_curso = c.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON d.id_docente = ac.id_docente
      LEFT JOIN usuario du ON du.id_usuario = d.id_usuario`;
  const condiciones = [];
  const parametros = [];

  if (req.query.docente) {
    condiciones.push('du.id_usuario = ?');
    parametros.push(req.query.docente);
  }
  if (req.query.alumno) {
    sql += `
      JOIN matricula m ON m.id_seccion = c.id_seccion AND m.estado = 1
      JOIN alumno al ON al.id_alumno = m.id_alumno`;
    condiciones.push('al.id_usuario = ?');
    parametros.push(req.query.alumno);
  }
  if (condiciones.length) sql += ' WHERE ' + condiciones.join(' AND ');
  sql += ' ORDER BY c.id_curso';

  const [filas] = await pool.query(sql, parametros);
  res.json(filas);
}));

app.get('/api/cursos/:id', autenticar, asyncRoute(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT c.*, CONCAT(s.nombre_seccion, ' (', s.periodo_academico, ')') AS nombre_seccion,
            CONCAT(du.nombre, ' ', du.apellido) AS nombre_docente
       FROM curso c
       JOIN seccion s ON s.id_seccion = c.id_seccion
       LEFT JOIN asignacion_curso ac ON ac.id_curso = c.id_curso AND ac.estado = 1
       LEFT JOIN docente d ON d.id_docente = ac.id_docente
       LEFT JOIN usuario du ON du.id_usuario = d.id_usuario
      WHERE c.id_curso = ?`,
    [req.params.id]
  );
  if (!filas[0]) return res.status(404).json({ mensaje: 'Curso no encontrado.' });
  res.json(filas[0]);
}));

app.post('/api/cursos', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  if (!req.body.nombre) return res.status(400).json({ mensaje: 'El nombre del curso es obligatorio.' });

  const [resultado] = await pool.query(
    `INSERT INTO curso (id_seccion, nombre, descripcion, estado) VALUES (?, ?, ?, ?)`,
    [Number(req.body.id_seccion ?? 1), req.body.nombre, req.body.descripcion ?? '', Number(req.body.estado ?? 1)]
  );
  const [filas] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [resultado.insertId]);
  res.status(201).json(filas[0]);
}));

app.put('/api/cursos/:id', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  const { nombre, descripcion, id_seccion, estado } = req.body;
  const [resultado] = await pool.query(
    `UPDATE curso SET
       nombre = COALESCE(?, nombre),
       descripcion = COALESCE(?, descripcion),
       id_seccion = COALESCE(?, id_seccion),
       estado = COALESCE(?, estado)
     WHERE id_curso = ?`,
    [nombre ?? null, descripcion ?? null, id_seccion ?? null, estado !== undefined ? Number(estado) : null, req.params.id]
  );
  if (resultado.affectedRows === 0) return res.status(404).json({ mensaje: 'Curso no encontrado.' });
  const [filas] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [req.params.id]);
  res.json(filas[0]);
}));

app.delete('/api/cursos/:id', autenticar, autorizar('ADMIN'), asyncRoute(async (req, res) => {
  const [resultado] = await pool.query('DELETE FROM curso WHERE id_curso = ?', [req.params.id]);
  if (resultado.affectedRows === 0) return res.status(404).json({ mensaje: 'Curso no encontrado.' });
  res.status(204).send();
}));

/* ---------- alumnos ---------- */

app.get('/api/alumnos', autenticar, autorizar('ADMIN', 'DOCENTE'), asyncRoute(async (req, res) => {
  let sql = `
    SELECT a.*, u.nombre, u.apellido, u.email
      FROM alumno a
      JOIN usuario u ON u.id_usuario = a.id_usuario`;
  const parametros = [];

  if (req.query.curso) {
    sql += `
      JOIN matricula m ON m.id_alumno = a.id_alumno AND m.estado = 1
      JOIN curso c ON c.id_seccion = m.id_seccion
     WHERE c.id_curso = ?`;
    parametros.push(req.query.curso);
  }
  sql += ' ORDER BY a.id_alumno';

  const [filas] = await pool.query(sql, parametros);
  res.json(filas);
}));

app.get('/api/alumnos/:id', autenticar, autorizar('ADMIN', 'DOCENTE'), asyncRoute(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT a.*, u.nombre, u.apellido, u.email
       FROM alumno a JOIN usuario u ON u.id_usuario = a.id_usuario
      WHERE a.id_alumno = ?`,
    [req.params.id]
  );
  if (!filas[0]) return res.status(404).json({ mensaje: 'Alumno no encontrado.' });
  res.json(filas[0]);
}));

/* ---------- notas ---------- */

app.get('/api/notas', autenticar, asyncRoute(async (req, res) => {
  let sql = `
    SELECT n.*, c.nombre AS nombre_curso, CONCAT(u.nombre, ' ', u.apellido) AS nombre_alumno
      FROM nota_curso n
      JOIN curso c ON c.id_curso = n.id_curso
      JOIN alumno al ON al.id_alumno = n.id_alumno
      JOIN usuario u ON u.id_usuario = al.id_usuario`;
  const condiciones = [];
  const parametros = [];

  if (req.usuario.rol === 'ALUMNO') {
    // El alumno solo puede ver sus propias notas: se ignora cualquier filtro recibido.
    condiciones.push('al.id_usuario = ?');
    parametros.push(req.usuario.sub);
  } else {
    if (req.query.curso) {
      condiciones.push('n.id_curso = ?');
      parametros.push(req.query.curso);
    }
    if (req.query.alumno) {
      condiciones.push('n.id_alumno = ?');
      parametros.push(req.query.alumno);
    }
  }
  if (condiciones.length) sql += ' WHERE ' + condiciones.join(' AND ');
  sql += ' ORDER BY n.id_nota';

  const [filas] = await pool.query(sql, parametros);
  res.json(filas);
}));

app.post('/api/notas', autenticar, autorizar('ADMIN', 'DOCENTE'), asyncRoute(async (req, res) => {
  const { id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion } = req.body;

  // El trigger trg_nota_curso_maximo tambien rechaza la 4ta evaluacion;
  // aqui se valida antes para devolver un mensaje inmediato y evitar el
  // viaje redondo a la base de datos cuando ya se sabe que fallara.
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM nota_curso WHERE id_curso = ? AND id_alumno = ?',
    [id_curso, id_alumno]
  );
  if (total >= 3) {
    return res.status(400).json({ mensaje: 'Solo se permiten 3 evaluaciones por alumno y curso.' });
  }

  const [resultado] = await pool.query(
    `INSERT INTO nota_curso (id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion)
     VALUES (?, ?, ?, ?, ?)`,
    [id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion]
  );

  const [filas] = await pool.query(
    `SELECT n.*, c.nombre AS nombre_curso, CONCAT(u.nombre, ' ', u.apellido) AS nombre_alumno
       FROM nota_curso n
       JOIN curso c ON c.id_curso = n.id_curso
       JOIN alumno al ON al.id_alumno = n.id_alumno
       JOIN usuario u ON u.id_usuario = al.id_usuario
      WHERE n.id_nota = ?`,
    [resultado.insertId]
  );
  res.status(201).json(filas[0]);
}));

app.put('/api/notas/:id', autenticar, autorizar('ADMIN', 'DOCENTE'), asyncRoute(async (req, res) => {
  const { nombre_evaluacion, calificacion, ponderacion } = req.body;
  const [resultado] = await pool.query(
    `UPDATE nota_curso SET
       nombre_evaluacion = COALESCE(?, nombre_evaluacion),
       calificacion = COALESCE(?, calificacion),
       ponderacion = COALESCE(?, ponderacion)
     WHERE id_nota = ?`,
    [nombre_evaluacion ?? null, calificacion ?? null, ponderacion ?? null, req.params.id]
  );
  if (resultado.affectedRows === 0) return res.status(404).json({ mensaje: 'Nota no encontrada.' });

  const [filas] = await pool.query('SELECT * FROM nota_curso WHERE id_nota = ?', [req.params.id]);
  res.json(filas[0]);
}));

app.delete('/api/notas/:id', autenticar, autorizar('ADMIN', 'DOCENTE'), asyncRoute(async (req, res) => {
  const [resultado] = await pool.query('DELETE FROM nota_curso WHERE id_nota = ?', [req.params.id]);
  if (resultado.affectedRows === 0) return res.status(404).json({ mensaje: 'Nota no encontrada.' });
  res.status(204).send();
}));

app.use((_req, res) => res.status(404).json({ mensaje: 'Recurso no disponible.' }));

app.listen(PUERTO, () => {
  console.log(`API escuchando en http://localhost:${PUERTO}/api (base de datos: ${process.env.DB_NAME || 'gestion_academica'})`);
});
