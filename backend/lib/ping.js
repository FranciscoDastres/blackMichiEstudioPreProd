const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({ now: result.rows[0].now });
  } catch (err) {
    console.error("Error en /api/ping:", err);
    res.status(500).json({ error: "Error de conexión a la base de datos" });
  }
};
