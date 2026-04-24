// backend/controllers/authController.ts
// ✅ SOLO HTTP HANDLING - La lógica está en authService.ts
import { Request, Response } from "express";
import * as authService from "../services/authService.js";
import logger from "../lib/logger.js";

// ✅ Registro
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      res.status(400).json({ error: "Faltan datos requeridos" });
      return;
    }
    const result = await authService.register(nombre, email, password);
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Error registro");
    res.status(400).json({ error: (err as Error).message || "Error al registrar usuario" });
  }
}

// ✅ Login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email y contraseña requeridos" });
      return;
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Error login");
    res.status(400).json({ error: (err as Error).message || "Error en el login" });
  }
}

// ✅ Google Login
export async function googleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body;
    logger.debug("Google Login request recibido");
    if (!token) {
      res.status(400).json({ error: "Token de Google requerido" });
      return;
    }
    const result = await authService.googleLogin(token);
    logger.info({ email: result?.user?.email }, "Google Login exitoso");
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Error Google Login");
    res.status(400).json({ error: (err as Error).message || "Error en Google Login" });
  }
}

// ✅ Me: devuelve el usuario del token actual
export async function me(req: Request, res: Response): Promise<void> {
  try {
    res.json({ user: req.user });
  } catch (err) {
    logger.error({ err }, "Error en /me");
    res.status(500).json({ error: "Error al obtener usuario" });
  }
}

// ✅ Logout (manejado en frontend con Supabase)
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // 🔥 No hacemos nada en backend
    res.json({ success: true, message: "Logout manejado en frontend" });
  } catch (err) {
    logger.error({ err }, "Error en logout");
    res.json({ success: true });
  }
}

// ✅ Solicitar reset de contraseña
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "El email es requerido" });
      return;
    }
    await authService.forgotPassword(email);
    res.json({ success: true, message: "Si el email existe, recibirás un enlace para restablecer tu contraseña" });
  } catch (err) {
    logger.error({ err }, "Error forgotPassword");
    res.json({ success: true });
  }
}

// ✅ Restablecer contraseña con token del email
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
      return;
    }
    await authService.resetPassword(token, newPassword);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error resetPassword");
    res.status(400).json({ error: (err as Error).message || "Error al restablecer la contraseña" });
  }
}

// ✅ Cambiar contraseña
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Contraseña actual y nueva son requeridas" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }
    await authService.changePassword(req.user!.auth_id, req.user!.email, currentPassword, newPassword);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error cambiando contraseña");
    res.status(400).json({ error: (err as Error).message || "Error al cambiar contraseña" });
  }
}
