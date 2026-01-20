//auth.js
const jwt = require('jsonwebtoken');
const pool = require('../lib/db');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No autorizado' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Traer datos completos del usuario desde la base de datos
    const result = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.user = result.rows[0]; // ahora req.user tiene id, nombre, email, rol
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token inválido' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo admin' });
  next();
}

module.exports = { requireAuth, requireAdmin };
