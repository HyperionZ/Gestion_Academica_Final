/**
 * Alternativa a ejecutar los .sql con el cliente `mysql`: crea la base
 * de datos, las tablas y carga los datos semilla usando el mismo driver
 * de Node (util si en tu equipo no tienes el cliente de linea de
 * comandos de MySQL a la mano).
 *
 * Uso: npm run db:init
 * Requiere un usuario con privilegios para crear bases de datos
 * (por defecto "root"); se configura con DB_ADMIN_USER / DB_ADMIN_PASSWORD.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const RUTA_SCHEMA = path.join(__dirname, '..', 'database', 'schema.sql');
const RUTA_SEED = path.join(__dirname, '..', 'database', 'seed.sql');

/** Quita las directivas `DELIMITER`, exclusivas del cliente `mysql`,
 * y devuelve el trigger terminado en `;` para que el driver lo entienda. */
function limpiarParaDriver(sql) {
  return sql
    .split('\n')
    .filter((linea) => !linea.trim().toUpperCase().startsWith('DELIMITER'))
    .join('\n')
    .replace(/\$\$/g, ';');
}

async function ejecutarArchivo(conexion, ruta) {
  const contenido = limpiarParaDriver(fs.readFileSync(ruta, 'utf-8'));
  await conexion.query(contenido);
}

async function main() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_ADMIN_USER || 'root',
    password: process.env.DB_ADMIN_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Creando base de datos y tablas...');
  await ejecutarArchivo(conexion, RUTA_SCHEMA);

  console.log('Cargando datos semilla...');
  await ejecutarArchivo(conexion, RUTA_SEED);

  const nombreApp = process.env.DB_USER || 'idat_app';
  const claveApp = process.env.DB_PASSWORD || 'idat_app_2026';
  const baseDatos = process.env.DB_NAME || 'gestion_academica';

  console.log(`Creando/actualizando el usuario de aplicacion "${nombreApp}"...`);
  await conexion.query(
    `CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?;`,
    [nombreApp, claveApp]
  );
  await conexion.query(`GRANT ALL PRIVILEGES ON \`${baseDatos}\`.* TO ?@'localhost';`, [nombreApp]);
  await conexion.query('FLUSH PRIVILEGES;');

  await conexion.end();
  console.log('Listo. La base de datos "gestion_academica" quedo creada y poblada.');
}

main().catch((error) => {
  console.error('No se pudo inicializar la base de datos:', error.message);
  process.exit(1);
});
