import db from "../lib/db.js";

export async function getPerfil(userId: number): Promise<unknown | null> {
    const result = await db.query(
        'SELECT id, nombre, email, rol, telefono, direccion_defecto, created_at FROM usuarios WHERE id=$1',
        [userId]
    );
    return result.rows[0] || null;
}

export interface UpdatePerfilData {
    nombre: string;
    telefono: string | null;
    direccion_defecto: string | null;
}

export async function updatePerfil(userId: number, { nombre, telefono, direccion_defecto }: UpdatePerfilData): Promise<unknown> {
    const result = await db.query(
        `UPDATE usuarios
         SET nombre=$1, telefono=$2, direccion_defecto=$3, updated_at=CURRENT_TIMESTAMP
         WHERE id=$4
         RETURNING id, nombre, email, rol, telefono, direccion_defecto`,
        [nombre, telefono, direccion_defecto, userId]
    );
    return result.rows[0];
}

const PEDIDO_ITEMS_SQL = `
    json_agg(
        json_build_object(
            'id',              pi.id,
            'producto_id',     pi.producto_id,
            'cantidad',        pi.cantidad,
            'precio_unitario', pi.precio_unitario,
            'subtotal',        pi.subtotal,
            'producto',        json_build_object(
                'titulo',           pr.titulo,
                'imagen_principal', pr.imagen_principal
            )
        )
    ) AS items
`;

export async function getPedidos(userId: number): Promise<unknown[]> {
    const result = await db.query(`
        SELECT p.*, ${PEDIDO_ITEMS_SQL}
        FROM pedidos p
        LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
        LEFT JOIN productos pr ON pi.producto_id = pr.id
        WHERE p.usuario_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
    `, [userId]);
    return result.rows;
}

export async function getPedidoById(pedidoId: number | string, userId: number): Promise<unknown | null> {
    const result = await db.query(`
        SELECT p.*,
            json_agg(
                json_build_object(
                    'id',              pi.id,
                    'producto_id',     pi.producto_id,
                    'cantidad',        pi.cantidad,
                    'precio_unitario', pi.precio_unitario,
                    'subtotal',        pi.subtotal,
                    'producto',        json_build_object(
                        'titulo',           pr.titulo,
                        'imagen_principal', pr.imagen_principal,
                        'descripcion',      pr.descripcion
                    )
                )
            ) AS items
        FROM pedidos p
        LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
        LEFT JOIN productos pr ON pi.producto_id = pr.id
        WHERE p.id = $1 AND p.usuario_id = $2
        GROUP BY p.id
    `, [pedidoId, userId]);
    return result.rows[0] || null;
}

export async function cancelarPedido(pedidoId: number | string, userId: number): Promise<void> {
    const pedido = await db.query(
        'SELECT estado FROM pedidos WHERE id=$1 AND usuario_id=$2',
        [pedidoId, userId]
    );
    if (!pedido.rows.length) throw Object.assign(new Error('Pedido no encontrado'), { status: 404 });
    if (pedido.rows[0].estado !== 'pendiente') {
        throw Object.assign(new Error('Solo pedidos pendientes se pueden cancelar'), { status: 400 });
    }

    await db.query(
        "UPDATE pedidos SET estado='cancelado', updated_at=CURRENT_TIMESTAMP WHERE id=$1",
        [pedidoId]
    );

    const items = await db.query(
        'SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id=$1',
        [pedidoId]
    );
    for (const item of items.rows) {
        await db.query(
            'UPDATE productos SET stock = stock + $1 WHERE id=$2',
            [item.cantidad, item.producto_id]
        );
    }
}

export async function getMisResenas(userId: number): Promise<unknown[]> {
    const result = await db.query(
        `SELECT v.id, v.calificacion, v.comentario, v.created_at,
                v.producto_id,
                p.titulo           AS producto_titulo,
                p.imagen_principal AS producto_imagen
         FROM valoraciones v
         JOIN productos p ON v.producto_id = p.id
         WHERE v.usuario_id = $1
         ORDER BY v.created_at DESC`,
        [userId]
    );
    return result.rows;
}
