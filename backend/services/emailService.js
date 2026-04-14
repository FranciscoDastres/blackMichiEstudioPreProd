import axios from "axios";
import logger from "../lib/logger.js";

const isProd = process.env.NODE_ENV === "production";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "pedidos@blackmichiestudio.cl";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@blackmichiestudio.cl";

async function sendEmail({ to, subject, html }) {
    if (!isProd) {
        logger.debug({ to, subject }, "Email (dev mode, no enviado)");
        return;
    }

    if (!RESEND_API_KEY) {
        logger.warn("RESEND_API_KEY no configurada — email no enviado");
        return;
    }

    try {
        await axios.post("https://api.resend.com/emails", {
            from: FROM_EMAIL,
            to,
            subject,
            html,
        }, {
            headers: { Authorization: `Bearer ${RESEND_API_KEY}` }
        });
    } catch (error) {
        logger.error({ err: error, to, subject }, "Error enviando email");
    }
}

export async function emailConfirmacionPago(pedido, items) {
    const itemsHtml = items.map(i =>
        `<tr>
            <td style="padding:8px;border-bottom:1px solid #333">${i.producto_titulo}</td>
            <td style="padding:8px;border-bottom:1px solid #333;text-align:center">${i.cantidad}</td>
            <td style="padding:8px;border-bottom:1px solid #333;text-align:right">$${Number(i.precio_unitario).toLocaleString("es-CL")}</td>
        </tr>`
    ).join("");

    await sendEmail({
        to: pedido.comprador_email,
        subject: `✅ Pedido #${pedido.id} confirmado — Black Michi Estudio`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7">¡Pago recibido! 🎉</h2>
            <p>Hola <strong>${pedido.comprador_nombre}</strong>, tu pedido fue confirmado.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0">
                <thead>
                    <tr style="background:#222">
                        <th style="padding:8px;text-align:left">Producto</th>
                        <th style="padding:8px;text-align:center">Cant.</th>
                        <th style="padding:8px;text-align:right">Precio</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <p style="font-size:18px">Total pagado: <strong>$${Number(pedido.total).toLocaleString("es-CL")}</strong></p>
            <p style="color:#999;font-size:13px">Dirección de envío: ${pedido.direccion_envio}</p>
            <p style="color:#999;font-size:13px">Te avisaremos cuando tu pedido sea despachado.</p>
        </div>`
    });
}

export async function emailNuevoPedidoAdmin(pedido, items) {
    const itemsHtml = items.map(i =>
        `<li>${i.cantidad}x ${i.producto_titulo} — $${Number(i.precio_unitario).toLocaleString("es-CL")}</li>`
    ).join("");

    await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🛒 Nuevo pedido #${pedido.id} — $${Number(pedido.total).toLocaleString("es-CL")}`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>Nuevo pedido recibido</h2>
            <p><strong>Cliente:</strong> ${pedido.comprador_nombre} (${pedido.comprador_email})</p>
            <p><strong>Total:</strong> $${Number(pedido.total).toLocaleString("es-CL")}</p>
            <p><strong>Dirección:</strong> ${pedido.direccion_envio}</p>
            <ul>${itemsHtml}</ul>
        </div>`
    });
}

export async function emailPedidoEnviado(pedido) {
    await sendEmail({
        to: pedido.comprador_email,
        subject: `📦 Tu pedido #${pedido.id} fue enviado — Black Michi Estudio`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7">Tu pedido está en camino 🚚</h2>
            <p>Hola <strong>${pedido.comprador_nombre}</strong>, tu pedido fue despachado.</p>
            ${pedido.numero_seguimiento
                ? `<p>Número de seguimiento: <strong style="color:#a855f7">${pedido.numero_seguimiento}</strong></p>`
                : ""}
            <p style="color:#999;font-size:13px">Dirección de envío: ${pedido.direccion_envio}</p>
        </div>`
    });
}
