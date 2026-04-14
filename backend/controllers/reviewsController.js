// backend/controllers/reviewsController.js
import * as reviewsService from '../services/reviewsService.js';

export async function getByProducto(req, res) {
    const { producto_id } = req.query;
    if (!producto_id) {
        return res.status(400).json({ error: 'producto_id requerido' });
    }
    try {
        const reviews = await reviewsService.getByProducto(producto_id);
        res.json(reviews);
    } catch (err) {
        console.error('Error getByProducto:', err);
        res.status(500).json({ error: 'Error al cargar reseñas' });
    }
}

export async function create(req, res) {
    const { producto_id, calificacion, comentario } = req.body;

    if (!producto_id || !calificacion || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    try {
        const review = await reviewsService.create(req.user.id, { producto_id, calificacion, comentario });
        res.status(201).json({ id: review.id, producto_id, calificacion, comentario });
    } catch (err) {
        console.error('Error create review:', err);
        res.status(err.status || 500).json({ error: err.message || 'Error al guardar la reseña' });
    }
}
