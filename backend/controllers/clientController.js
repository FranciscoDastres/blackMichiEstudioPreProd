// backend/controllers/clientController.js
import * as clientService from '../services/clientService.js';
import logger from '../lib/logger.js';

// ===== PERFIL =====

export async function getPerfil(req, res) {
    try {
        const perfil = await clientService.getPerfil(req.user.id);
        if (!perfil) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(perfil);
    } catch (err) {
        logger.error({ err }, "Error getPerfil");
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
}

export async function updatePerfil(req, res) {
    try {
        const { nombre, telefono, direccion_defecto } = req.body;
        const perfil = await clientService.updatePerfil(req.user.id, { nombre, telefono, direccion_defecto });
        res.json(perfil);
    } catch (err) {
        logger.error({ err }, "Error updatePerfil");
        res.status(400).json({ error: 'Error al actualizar perfil' });
    }
}

// ===== PEDIDOS =====

export async function getPedidos(req, res) {
    try {
        const pedidos = await clientService.getPedidos(req.user.id);
        res.json(pedidos);
    } catch (err) {
        logger.error({ err }, "Error getPedidos");
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
}

export async function getPedidoById(req, res) {
    try {
        const pedido = await clientService.getPedidoById(req.params.id, req.user.id);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(pedido);
    } catch (err) {
        logger.error({ err }, "Error getPedidoById");
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
}

export async function cancelarPedido(req, res) {
    try {
        await clientService.cancelarPedido(req.params.id, req.user.id);
        res.json({ message: 'Pedido cancelado correctamente' });
    } catch (err) {
        logger.error({ err }, "Error cancelarPedido");
        res.status(err.status || 400).json({ error: err.message || 'Error al cancelar pedido' });
    }
}

// ===== RESEÑAS =====

export async function getMisResenas(req, res) {
    try {
        const resenas = await clientService.getMisResenas(req.user.id);
        res.json(resenas);
    } catch (err) {
        logger.error({ err }, "Error getMisResenas");
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
}
