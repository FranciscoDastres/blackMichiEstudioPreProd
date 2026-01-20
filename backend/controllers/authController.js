// backend/controllers/authController.js
const pool = require('../lib/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generar token JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Registro tradicional
async function register(req, res) {
  const { nombre, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, hashed, 'cliente']
    );
    const user = result.rows[0];
    res.json({ user, token: generateToken(user) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Error al registrar usuario' });
  }
}

// Login tradicional
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });

    res.json({ user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }, token: generateToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en login' });
  }
}

// Login / Registro con Google
async function googleLogin(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Falta idToken' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    // Verificar si el usuario ya existe
    let result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    let user;
    if (result.rows.length === 0) {
      // Crear usuario nuevo
      result = await pool.query(
        'INSERT INTO usuarios (nombre, email, rol, imagen) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, imagen',
        [name, email, 'cliente', picture]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
    }

    res.json({ user, token: generateToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en login con Google' });
  }
}

module.exports = { register, login, googleLogin };
