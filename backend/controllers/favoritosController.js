// backend/controllers/favoritosController.js
import * as favoritosService from "../services/favoritosService.js";
import logger from "../lib/logger.js";

export async function listar(req, res) {
    try {
        const favoritos = await favoritosService.listar(req.user.id);
        res.json(favoritos);
    } catch (err) {
        logger.error({ err }, "Error listando favoritos");
        res.status(500).json({ error: "Error al obtener favoritos" });
    }
}

export async function listarIds(req, res) {
    try {
        const ids = await favoritosService.listarIds(req.user.id);
        res.json({ ids });
    } catch (err) {
        logger.error({ err }, "Error listando ids favoritos");
        res.status(500).json({ error: "Error al obtener favoritos" });
    }
}

export async function agregar(req, res) {
    try {
        const productoId = Number(req.params.productoId || req.body.productoId);
        if (!Number.isFinite(productoId)) return res.status(400).json({ error: "ID inválido" });
        const result = await favoritosService.agregar(req.user.id, productoId);
        res.status(201).json(result);
    } catch (err) {
        logger.error({ err }, "Error agregando favorito");
        res.status(err.status || 500).json({ error: err.message || "Error al agregar favorito" });
    }
}

export async function quitar(req, res) {
    try {
        const productoId = Number(req.params.productoId);
        if (!Number.isFinite(productoId)) return res.status(400).json({ error: "ID inválido" });
        const result = await favoritosService.quitar(req.user.id, productoId);
        res.json(result);
    } catch (err) {
        logger.error({ err }, "Error quitando favorito");
        res.status(500).json({ error: "Error al quitar favorito" });
    }
}

export async function toggle(req, res) {
    try {
        const productoId = Number(req.params.productoId || req.body.productoId);
        if (!Number.isFinite(productoId)) return res.status(400).json({ error: "ID inválido" });
        const result = await favoritosService.toggle(req.user.id, productoId);
        res.json(result);
    } catch (err) {
        logger.error({ err }, "Error toggle favorito");
        res.status(500).json({ error: "Error al actualizar favorito" });
    }
}
