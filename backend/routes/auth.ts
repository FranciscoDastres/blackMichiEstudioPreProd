// backend/routes/auth.ts
import express from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Rutas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Rutas que requieren token válido
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);
router.post("/change-password", requireAuth, authController.changePassword);

export default router;
