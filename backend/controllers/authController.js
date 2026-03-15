// backend/controllers/authController.js
// ✅ SOLO HTTP HANDLING - La lógica está en authService.js
const authService = require("../services/authService");

// ✅ Registro
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

// ✅ Login
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

// ✅ Google Login
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
