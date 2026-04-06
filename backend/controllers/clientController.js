// backend/controllers/clientController.js
const clientService = require('../services/clientService');

// ===== PERFIL =====

async function getPerfil(req, res) {
    try {
        const perfil = await clientService.getPerfil(req.user.id);
        if (!perfil) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(perfil);
    } catch (err) {
        console.error('Error getPerfil:', err);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
}

async function updatePerfil(req, res) {
    try {
        const { nombre, telefono, direccion_defecto } = req.body;
        const perfil = await clientService.updatePerfil(req.user.id, { nombre, telefono, direccion_defecto });
        res.json(perfil);
    } catch (err) {
        console.error('Error updatePerfil:', err);
        res.status(400).json({ error: 'Error al actualizar perfil' });
    }
}

// ===== PEDIDOS =====

async function getPedidos(req, res) {
    try {
        const pedidos = await clientService.getPedidos(req.user.id);
        res.json(pedidos);
    } catch (err) {
        console.error('Error getPedidos:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
}

async function getPedidoById(req, res) {
    try {
        const pedido = await clientService.getPedidoById(req.params.id, req.user.id);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(pedido);
    } catch (err) {
        console.error('Error getPedidoById:', err);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
}

async function cancelarPedido(req, res) {
    try {
        await clientService.cancelarPedido(req.params.id, req.user.id);
        res.json({ message: 'Pedido cancelado correctamente' });
    } catch (err) {
        console.error('Error cancelarPedido:', err);
        res.status(err.status || 400).json({ error: err.message || 'Error al cancelar pedido' });
    }
}

// ===== RESEÑAS =====

async function getMisResenas(req, res) {
    try {
        const resenas = await clientService.getMisResenas(req.user.id);
        res.json(resenas);
    } catch (err) {
        console.error('Error getMisResenas:', err);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
}

module.exports = {
    getPerfil,
    updatePerfil,
    getPedidos,
    getPedidoById,
    cancelarPedido,
    getMisResenas,
};
