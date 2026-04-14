import db from "../lib/db.js";

export async function getByProducto(productoId) {
    const result = await db.query(
        `SELECT v.id, v.calificacion, v.comentario, v.created_at,
                u.nombre AS usuario_nombre, u.email AS usuario_email
         FROM valoraciones v
         LEFT JOIN usuarios u ON v.usuario_id = u.id
         WHERE v.producto_id = $1
         ORDER BY v.created_at DESC`,
        [productoId]
    );
    return result.rows;
}

export async function create(usuarioId, { producto_id, calificacion, comentario }) {
    const ordenEntregada = await db.query(
        `SELECT 1 FROM pedido_items pi
         JOIN pedidos p ON pi.pedido_id = p.id
         WHERE p.usuario_id = $1 AND pi.producto_id = $2 AND p.estado = 'entregado'
         LIMIT 1`,
        [usuarioId, producto_id]
    );

    if (ordenEntregada.rows.length === 0) {
        throw Object.assign(
            new Error('Solo puedes reseñar productos que hayas recibido.'),
            { status: 403 }
        );
    }

    const result = await db.query(
        `INSERT INTO valoraciones (producto_id, usuario_id, calificacion, comentario)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [producto_id, usuarioId, calificacion, comentario || null]
    );

    return result.rows[0];
}
