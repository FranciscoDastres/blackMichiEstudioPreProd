// backend/routes/cupones.ts — Endpoint público (validar cupón)
import express from "express";
import rateLimit from "express-rate-limit";
import * as cuponesController from "../controllers/cuponesController.js";

const router = express.Router();

const cuponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: "Demasiadas validaciones de cupón. Intenta más tarde." },
});

router.post("/validar", cuponLimiter, cuponesController.validarCupon);

export default router;
