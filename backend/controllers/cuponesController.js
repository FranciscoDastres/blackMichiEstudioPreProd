// backend/controllers/cuponesController.js
import * as cuponService from "../services/cuponService.js";
import logger from "../lib/logger.js";

// Público: validar cupón
export async function validarCupon(req, res) {
    try {
        const { codigo, total } = req.body;
        const totalNum = Number(total);
        if (!codigo) return res.status(400).json({ error: "Código requerido" });
        if (!Number.isFinite(totalNum) || totalNum <= 0) {
            return res.status(400).json({ error: "Total inválido" });
        }

        const resultado = await cuponService.validarCupon(codigo, totalNum);
        if (!resultado.valido) return res.status(400).json(resultado);
        return res.json(resultado);
    } catch (err) {
        logger.error({ err }, "Error validando cupón");
        res.status(500).json({ error: "Error validando cupón" });
    }
}

// Admin
export async function listar(req, res) {
    try {
        const cupones = await cuponService.listarCupones();
        res.json(cupones);
    } catch (err) {
        logger.error({ err }, "Error listando cupones");
        res.status(500).json({ error: "Error listando cupones" });
    }
}

export async function crear(req, res) {
    try {
        const { codigo, tipo, valor } = req.body;
        if (!codigo || !tipo || valor == null) {
            return res.status(400).json({ error: "codigo, tipo y valor son requeridos" });
        }
        if (!["porcentaje", "monto_fijo"].includes(tipo)) {
            return res.status(400).json({ error: "Tipo inválido (porcentaje o monto_fijo)" });
        }
        const cupon = await cuponService.crearCupon(req.body);
        res.status(201).json(cupon);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Ya existe un cupón con ese código" });
        }
        logger.error({ err }, "Error creando cupón");
        res.status(500).json({ error: "Error creando cupón" });
    }
}

export async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const cupon = await cuponService.actualizarCupon(id, req.body);
        res.json(cupon);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Ya existe un cupón con ese código" });
        }
        logger.error({ err }, "Error actualizando cupón");
        res.status(err.status || 500).json({ error: err.message || "Error actualizando cupón" });
    }
}

export async function eliminar(req, res) {
    try {
        const { id } = req.params;
        await cuponService.eliminarCupon(id);
        res.json({ ok: true });
    } catch (err) {
        logger.error({ err }, "Error eliminando cupón");
        res.status(err.status || 500).json({ error: err.message || "Error eliminando cupón" });
    }
}
