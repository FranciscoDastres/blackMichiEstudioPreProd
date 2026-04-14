// backend/controllers/authController.js
// ✅ SOLO HTTP HANDLING - La lógica está en authService.js
import * as authService from "../services/authService.js";

// ✅ Registro
export async function register(req, res) {
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
}

// ✅ Login
export async function login(req, res) {
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
}

// ✅ Google Login
export async function googleLogin(req, res) {
  try {
    const { token } = req.body;
    console.log("🔵 Google Login request recibido, token:", token ? `${token.substring(0, 20)}...` : "FALTA");
    if (!token) {
      return res.status(400).json({ error: "Token de Google requerido" });
    }
    const result = await authService.googleLogin(token);
    console.log("🟢 Google Login exitoso para:", result?.user?.email);
    res.json(result);
  } catch (err) {
    console.error("❌ Error Google Login:", err.message);
    res.status(400).json({ error: err.message || "Error en Google Login" });
  }
}

// ✅ Me: devuelve el usuario del token actual
export async function me(req, res) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("❌ Error en /me:", err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
}

// ✅ Logout: invalida el token en Supabase
export async function logout(req, res) {
  try {
    await authService.logout(req.user.auth_id);
    res.json({ success: true });
  } catch (err) {
    // Aunque falle en Supabase, el frontend igual limpia su localStorage
    console.error("❌ Error en logout:", err);
    res.json({ success: true });
  }
}

// ✅ Solicitar reset de contraseña
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'El email es requerido' });
    await authService.forgotPassword(email);
    res.json({ success: true, message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
  } catch (err) {
    console.error('❌ Error forgotPassword:', err);
    res.json({ success: true });
  }
}

// ✅ Restablecer contraseña con token del email
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }
    await authService.resetPassword(token, newPassword);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error resetPassword:', err);
    res.status(400).json({ error: err.message || 'Error al restablecer la contraseña' });
  }
}

// ✅ Cambiar contraseña
export async function changePassword(req, res) {
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
}
