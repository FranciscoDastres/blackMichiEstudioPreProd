import pg from "pg";
import "dotenv/config";
import logger from "./logger.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.PG_URI;

let config;

// Determinamos si necesitamos SSL (En producción o si usamos conexión remota)
const isProduction = process.env.NODE_ENV === 'production' || connectionString?.includes('supabase.co') || connectionString?.includes('render.com');

if (connectionString) {
  config = {
    connectionString,
    // Forzamos SSL con rejectUnauthorized: false para evitar el error de certificado autofirmado
    ssl: isProduction ? { rejectUnauthorized: false } : false
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
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };
}

logger.info({
  mode: connectionString ? 'URL' : 'local/manual',
  host: config.host || 'connectionString',
  ssl: !!config.ssl
}, "Database config");

const pool = new Pool(config);

// Event handlers
pool.on('connect', () => {
  logger.info("Conectado a PostgreSQL");
});

pool.on('error', (err) => {
  logger.error({ err }, "Error inesperado en PostgreSQL");
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ duration: `${duration}ms`, rows: res.rowCount }, "Query ejecutada");
    return res;
  } catch (error) {
    logger.error({ err: error, sql: text }, "Error en query DB");
    throw error;
  }
};

export { query, pool };
export default { query, pool };