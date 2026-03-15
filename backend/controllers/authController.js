// backend/controllers/authController.js
// ✅ SOLO HTTP HANDLING - La lógica está en authService.js
const authService = require("../services/authService");

// Registro
async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const result = await authService.register(nombre, email, password);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Error al registrar usuario" });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Error en el login" });
  }
}

// Google Login
async function googleLogin(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token de Google requerido" });
    }

    const result = await authService.googleLogin(token);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Error en Google Login" });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
};
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
