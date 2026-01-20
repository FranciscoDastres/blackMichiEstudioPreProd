const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.status(200).json({ tablas: result.rows });
  } catch (err) {
    console.error("Error en /api/test-db:", err);
    res.status(500).json({ error: "Error al obtener tablas de la DB" });
  }
};
