// backend/controllers/clientController.ts
import { Request, Response } from "express";
import * as clientService from "../services/clientService.js";
import logger from "../lib/logger.js";

// ===== PERFIL =====

export async function getPerfil(req: Request, res: Response): Promise<void> {
  try {
    const perfil = await clientService.getPerfil(req.user!.id);
    if (!perfil) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.json(perfil);
  } catch (err) {
    logger.error({ err }, "Error getPerfil");
    res.status(500).json({ error: "Error al obtener perfil" });
  }
}

export async function updatePerfil(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, telefono, direccion_defecto } = req.body;
    const perfil = await clientService.updatePerfil(req.user!.id, { nombre, telefono, direccion_defecto });
    res.json(perfil);
  } catch (err) {
    logger.error({ err }, "Error updatePerfil");
    res.status(400).json({ error: "Error al actualizar perfil" });
  }
}

// ===== PEDIDOS =====

export async function getPedidos(req: Request, res: Response): Promise<void> {
  try {
    const pedidos = await clientService.getPedidos(req.user!.id);
    res.json(pedidos);
  } catch (err) {
    logger.error({ err }, "Error getPedidos");
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}

export async function getPedidoById(req: Request, res: Response): Promise<void> {
  try {
    const pedido = await clientService.getPedidoById(req.params.id as string, req.user!.id);
    if (!pedido) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }
    res.json(pedido);
  } catch (err) {
    logger.error({ err }, "Error getPedidoById");
    res.status(500).json({ error: "Error al obtener pedido" });
  }
}

export async function cancelarPedido(req: Request, res: Response): Promise<void> {
  try {
    await clientService.cancelarPedido(req.params.id as string, req.user!.id);
    res.json({ message: "Pedido cancelado correctamente" });
  } catch (err: any) {
    logger.error({ err }, "Error cancelarPedido");
    res.status(err.status || 400).json({ error: err.message || "Error al cancelar pedido" });
  }
}

// ===== RESEÑAS =====

export async function getMisResenas(req: Request, res: Response): Promise<void> {
  try {
    const resenas = await clientService.getMisResenas(req.user!.id);
    res.json(resenas);
  } catch (err) {
    logger.error({ err }, "Error getMisResenas");
    res.status(500).json({ error: "Error al obtener reseñas" });
  }
}
