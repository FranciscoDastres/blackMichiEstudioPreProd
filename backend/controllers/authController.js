// backend/controllers/authController.js
// ✅ SOLO HTTP HANDLING - La lógica está en authService.js
const authService = require("../services/authService");

// ✅ Registro — sin cambios
exports.register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    const result = await authService.register(nombre, email, password);
    res.json(result);
  } catch (err) {
    console.error("❌ Error registro:", err);
    res.status(400).json({ error: err.message || "Error al registrar usuario" });
  }
};

// ✅ Login — sin cambios
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    console.error("❌ Error login:", err);
    res.status(400).json({ error: err.message || "Error en el login" });
  }
};

// ✅ Google Login — sin cambios
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token de Google requerido" });
    }
    const result = await authService.googleLogin(token);
    res.json(result);
  } catch (err) {
    console.error("❌ Error Google Login:", err);
    res.status(400).json({ error: err.message || "Error en Google Login" });
  }
};

// ✅ NUEVO — Me: devuelve el usuario del token actual
// El middleware requireAuth ya validó el token y puso req.user
// Solo devolvemos lo que ya tenemos, sin llamada extra a la BD
exports.me = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("❌ Error en /me:", err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// ✅ NUEVO — Logout: invalida el token en Supabase
exports.logout = async (req, res) => {
  try {
    await authService.logout(req.user.auth_id);
    res.json({ success: true });
  } catch (err) {
    // Aunque falle en Supabase, el frontend igual limpia su localStorage
    console.error("❌ Error en logout:", err);
    res.json({ success: true });
  }
};

// ✅ NUEVO — Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    await authService.changePassword(req.user.auth_id, req.user.email, currentPassword, newPassword);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error cambiando contraseña:', err);
    res.status(400).json({ error: err.message || 'Error al cambiar contraseña' });
  }
};
