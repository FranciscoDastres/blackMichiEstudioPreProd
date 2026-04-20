import pg from "pg";
import "dotenv/config";
import logger from "./logger.js";

const { Pool } = pg;

// Prioriza DATABASE_URL, luego PG_URI
const connectionString = process.env.DATABASE_URL || process.env.PG_URI;

let config;
if (connectionString) {
  config = {
    connectionString,
    ssl: { rejectUnauthorized: true }
  };
} else {
  if (!process.env.DB_PASSWORD) {
    logger.fatal("DB_PASSWORD es obligatorio cuando no se usa DATABASE_URL");
    process.exit(1);
  }
  config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'blackmichiestudio',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
  };
}

logger.info({
  mode: connectionString ? 'URL' : 'local/manual',
  host: config.host || 'connectionString',
}, "Database config");

const pool = new Pool(config);

// Event handlers
pool.on('connect', () => {
  logger.info("Conectado a PostgreSQL");
});

pool.on('error', (err) => {
  logger.error({ err }, "Error inesperado en PostgreSQL");
});

// Función helper para queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug({ duration: `${duration}ms`, rows: res.rowCount }, "Query ejecutada");

    return res;
  } catch (error) {
    logger.error({ err: error }, "Error en query DB");
    throw error;
  }
};

// Exportar tanto el pool como la función query
export { query, pool };
export default { query, pool };
