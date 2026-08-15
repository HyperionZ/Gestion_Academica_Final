/**
 * Pool de conexiones a MySQL/MariaDB. Se reutiliza en toda la API
 * en vez de abrir una conexion nueva por cada peticion.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'idat_app',
  password: process.env.DB_PASSWORD || 'idat_app_2026',
  database: process.env.DB_NAME || 'gestion_academica',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

module.exports = pool;
