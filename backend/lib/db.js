const { Pool } = require("pg");
require("dotenv").config();

// Prioriza DATABASE_URL, luego PG_URI
const connectionString = process.env.DATABASE_URL || process.env.PG_URI;

const config = connectionString
  ? {
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  }
  : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'blackmichiestudio',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'hola123',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  };

console.log('Database config:', {
  mode: connectionString ? 'URL' : 'local/manual',
  connectionString: connectionString ? 'used' : 'not used',
  host: config.host || 'connectionString'
});

const pool = new Pool(config);

// Event handlers
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
});

// Función helper para queries (compatible con tu código de payments.js)
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('Query ejecutada:', { duration: `${duration}ms`, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('❌ Error en query DB:', error.message);
    throw error;
  }
};

// Exportar tanto el pool como la función query
module.exports = {
  query,
  pool,
  // Para compatibilidad con código que importa solo el pool
  ...pool
};
