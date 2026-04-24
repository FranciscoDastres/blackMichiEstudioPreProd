// backend/controllers/cuponesController.ts
import { Request, Response } from "express";
import * as cuponService from "../services/cuponService.js";
import logger from "../lib/logger.js";

// Público: validar cupón
export async function validarCupon(req: Request, res: Response): Promise<void> {
  try {
    const { codigo, total } = req.body;
    const totalNum = Number(total);
    if (!codigo) {
      res.status(400).json({ error: "Código requerido" });
      return;
    }
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      res.status(400).json({ error: "Total inválido" });
      return;
    }

    const resultado = await cuponService.validarCupon(codigo, totalNum);
    if (!resultado.valido) {
      res.status(400).json(resultado);
      return;
    }
    res.json(resultado);
  } catch (err) {
    logger.error({ err }, "Error validando cupón");
    res.status(500).json({ error: "Error validando cupón" });
  }
}

// Admin
export async function listar(req: Request, res: Response): Promise<void> {
  try {
    const cupones = await cuponService.listarCupones();
    res.json(cupones);
  } catch (err) {
    logger.error({ err }, "Error listando cupones");
    res.status(500).json({ error: "Error listando cupones" });
  }
}

export async function crear(req: Request, res: Response): Promise<void> {
  try {
    const { codigo, tipo, valor } = req.body;
    if (!codigo || !tipo || valor == null) {
      res.status(400).json({ error: "codigo, tipo y valor son requeridos" });
      return;
    }
    if (!["porcentaje", "monto_fijo"].includes(tipo)) {
      res.status(400).json({ error: "Tipo inválido (porcentaje o monto_fijo)" });
      return;
    }
    const cupon = await cuponService.crearCupon(req.body);
    res.status(201).json(cupon);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Ya existe un cupón con ese código" });
      return;
    }
    logger.error({ err }, "Error creando cupón");
    res.status(500).json({ error: "Error creando cupón" });
  }
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const cupon = await cuponService.actualizarCupon(id, req.body);
    res.json(cupon);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Ya existe un cupón con ese código" });
      return;
    }
    logger.error({ err }, "Error actualizando cupón");
    res.status(err.status || 500).json({ error: err.message || "Error actualizando cupón" });
  }
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await cuponService.eliminarCupon(id);
    res.json({ ok: true });
  } catch (err: any) {
    logger.error({ err }, "Error eliminando cupón");
    res.status(err.status || 500).json({ error: err.message || "Error eliminando cupón" });
  }
}
