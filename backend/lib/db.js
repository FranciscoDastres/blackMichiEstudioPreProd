const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL || process.env.PG_URI;

const config = connectionString
  ? {
    connectionString,
    ssl: {
      rejectUnauthorized: false // Requerido para Render/Supabase
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

const pool = new Pool(config);

// Handlers de conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

// Función helper para queries (Mantiene el log y manejo de errores)
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Query ejecutada:', { duration: `${duration}ms`, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('❌ Error en query DB:', error.message);
    throw error;
  }
};

// EXPORTACIÓN CORRECTA
// Exportamos el pool directamente y la función query
module.exports = {
  pool,
  query
};