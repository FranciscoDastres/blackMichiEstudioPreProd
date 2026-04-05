// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { requireAuth } = require('../middleware/auth');

// GET /reviews?producto_id=xxx
router.get('/', async (req, res) => {
    const { producto_id } = req.query;
    if (!producto_id) {
        return res.status(400).json({ error: 'producto_id requerido' });
    }
    try {
        const result = await db.query(
            `SELECT v.id, v.calificacion, v.comentario, v.created_at,
              u.nombre as usuario_nombre, u.email as usuario_email
       FROM valoraciones v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.producto_id = $1
       ORDER BY v.created_at DESC`,
            [producto_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ error: 'Error al cargar reseñas' });
    }
});

// GET /reviews/producto/:productId (kept for compatibility)
router.get('/producto/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await db.query(
            `SELECT v.id, v.calificacion, v.comentario, v.created_at,
              u.nombre as usuario_nombre, u.email as usuario_email
       FROM valoraciones v
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.producto_id = $1
       ORDER BY v.created_at DESC`,
            [productId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ error: 'Error al cargar reseñas' });
    }
});

// POST /reviews — requiere usuario autenticado + pedido entregado
router.post('/', requireAuth, async (req, res) => {
    try {
        const { producto_id, calificacion, comentario } = req.body;
        const usuario_id = req.user.id;

        if (!producto_id || !calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ error: 'Datos inválidos' });
        }

        // Verificar que el usuario haya recibido el producto
        const ordenEntregada = await db.query(
            `SELECT 1 FROM pedido_items pi
             JOIN pedidos p ON pi.pedido_id = p.id
             WHERE p.usuario_id = $1 AND pi.producto_id = $2 AND p.estado = 'entregado'
             LIMIT 1`,
            [usuario_id, producto_id]
        );

        if (ordenEntregada.rows.length === 0) {
            return res.status(403).json({
                error: 'Solo puedes reseñar productos que hayas recibido.'
            });
        }

        // El trigger trg_valoraciones_sync_producto actualiza promedio automáticamente
        const result = await db.query(
            `INSERT INTO valoraciones (producto_id, usuario_id, calificacion, comentario)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [producto_id, usuario_id, calificacion, comentario || null]
        );

        res.status(201).json({
            id: result.rows[0].id,
            producto_id,
            calificacion,
            comentario
        });
    } catch (error) {
        console.error('Error al crear reseña:', error);
        res.status(500).json({ error: 'Error al guardar la reseña' });
    }
});

module.exports = router;