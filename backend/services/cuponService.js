// backend/services/cuponService.js
import db from "../lib/db.js";

/**
 * Valida un cupón contra un total de carrito y retorna el descuento calculado.
 * @param {string} codigo - Código del cupón (case-insensitive).
 * @param {number} totalCarrito - Subtotal del carrito (sin envío).
 * @returns {Promise<{valido: boolean, cupon: object|null, descuento: number, error?: string}>}
 */
export async function validarCupon(codigo, totalCarrito) {
    if (!codigo || typeof codigo !== "string") {
        return { valido: false, cupon: null, descuento: 0, error: "Código de cupón inválido" };
    }

    const result = await db.query(
        `SELECT * FROM cupones
         WHERE UPPER(codigo) = UPPER($1) AND activo = true`,
        [codigo.trim()]
    );

    if (!result.rows.length) {
        return { valido: false, cupon: null, descuento: 0, error: "Cupón no encontrado o inactivo" };
    }

    const cupon = result.rows[0];

    // Expiración
    if (cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < new Date()) {
        return { valido: false, cupon: null, descuento: 0, error: "Cupón expirado" };
    }

    // Usos máximos
    if (cupon.usos_maximos != null && cupon.usos_actuales >= cupon.usos_maximos) {
        return { valido: false, cupon: null, descuento: 0, error: "Cupón agotado" };
    }

    // Monto mínimo
    if (cupon.monto_minimo && Number(totalCarrito) < Number(cupon.monto_minimo)) {
        return {
            valido: false,
            cupon: null,
            descuento: 0,
            error: `Compra mínima de $${Number(cupon.monto_minimo).toLocaleString("es-CL")} CLP`,
        };
    }

    // Calcular descuento
    let descuento = 0;
    if (cupon.tipo === "porcentaje") {
        descuento = Math.round((Number(totalCarrito) * Number(cupon.valor)) / 100);
    } else if (cupon.tipo === "monto_fijo") {
        descuento = Math.min(Number(cupon.valor), Number(totalCarrito));
    }

    descuento = Math.max(0, Math.round(descuento));

    return {
        valido: true,
        cupon: {
            id: cupon.id,
            codigo: cupon.codigo,
            tipo: cupon.tipo,
            valor: Number(cupon.valor),
            descripcion: cupon.descripcion,
        },
        descuento,
    };
}

export async function incrementarUso(cuponId) {
    if (!cuponId) return;
    await db.query(
        `UPDATE cupones SET usos_actuales = usos_actuales + 1, updated_at = NOW() WHERE id = $1`,
        [cuponId]
    );
}

// ─── ADMIN CRUD ───────────────────────────────────────────────────────────────

export async function listarCupones() {
    const result = await db.query(`SELECT * FROM cupones ORDER BY created_at DESC`);
    return result.rows;
}

export async function crearCupon({
    codigo,
    descripcion,
    tipo,
    valor,
    monto_minimo,
    usos_maximos,
    fecha_expiracion,
    activo,
}) {
    const result = await db.query(
        `INSERT INTO cupones
          (codigo, descripcion, tipo, valor, monto_minimo, usos_maximos, fecha_expiracion, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
            String(codigo).trim().toUpperCase(),
            descripcion || null,
            tipo,
            Number(valor),
            monto_minimo != null ? Number(monto_minimo) : 0,
            usos_maximos != null ? Number(usos_maximos) : null,
            fecha_expiracion || null,
            activo !== false,
        ]
    );
    return result.rows[0];
}

export async function actualizarCupon(id, data) {
    const current = await db.query(`SELECT * FROM cupones WHERE id = $1`, [id]);
    if (!current.rows.length) throw Object.assign(new Error("Cupón no encontrado"), { status: 404 });

    const existing = current.rows[0];
    const merged = {
        codigo: (data.codigo ?? existing.codigo).toString().trim().toUpperCase(),
        descripcion: data.descripcion ?? existing.descripcion,
        tipo: data.tipo ?? existing.tipo,
        valor: data.valor != null ? Number(data.valor) : Number(existing.valor),
        monto_minimo: data.monto_minimo != null ? Number(data.monto_minimo) : Number(existing.monto_minimo),
        usos_maximos: data.usos_maximos !== undefined
            ? (data.usos_maximos === null ? null : Number(data.usos_maximos))
            : existing.usos_maximos,
        fecha_expiracion: data.fecha_expiracion !== undefined ? data.fecha_expiracion : existing.fecha_expiracion,
        activo: data.activo !== undefined ? !!data.activo : existing.activo,
    };

    const result = await db.query(
        `UPDATE cupones
            SET codigo=$1, descripcion=$2, tipo=$3, valor=$4, monto_minimo=$5,
                usos_maximos=$6, fecha_expiracion=$7, activo=$8, updated_at=NOW()
          WHERE id=$9
         RETURNING *`,
        [
            merged.codigo, merged.descripcion, merged.tipo, merged.valor,
            merged.monto_minimo, merged.usos_maximos, merged.fecha_expiracion,
            merged.activo, id,
        ]
    );
    return result.rows[0];
}

export async function eliminarCupon(id) {
    const result = await db.query(`DELETE FROM cupones WHERE id = $1 RETURNING id`, [id]);
    if (!result.rows.length) throw Object.assign(new Error("Cupón no encontrado"), { status: 404 });
    return { success: true };
}
