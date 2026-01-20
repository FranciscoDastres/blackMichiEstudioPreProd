// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db'); // ← esto es { query, pool, ... }

// GET /reviews/producto/:productId
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

// POST /reviews
router.post('/', async (req, res) => {
    try {
        const { producto_id, usuario_id, calificacion, comentario } = req.body;

        if (!producto_id || !calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ error: 'Datos inválidos' });
        }

        const result = await db.query(
            `INSERT INTO valoraciones (producto_id, usuario_id, calificacion, comentario)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
            [producto_id, usuario_id || null, calificacion, comentario || null]
        );

        // Actualizar promedio en productos
        await db.query(
            `UPDATE productos p
       SET 
         total_valoraciones = (SELECT COUNT(*) FROM valoraciones v WHERE v.producto_id = p.id),
         promedio_calificacion = (SELECT AVG(calificacion) FROM valoraciones v WHERE v.producto_id = p.id)
       WHERE p.id = $1`,
            [producto_id]
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