import axios from "axios";
import logger from "../lib/logger.js";

const isProd = process.env.NODE_ENV === "production";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "pedidos@blackmichiestudio.cl";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@blackmichiestudio.cl";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://blackmichiestudio.cl";

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

    const trackingUrl = `${FRONTEND_URL}/payment/return?pedidoId=${pedido.id}&token=${encodeURIComponent(pedido.flow_token)}`;

    await sendEmail({
        to: pedido.comprador_email,
        subject: `Pedido #${pedido.id} confirmado — Black Michi Estudio`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7">Pago recibido</h2>
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
            <p style="color:#999;font-size:13px">Direccion de envio: ${pedido.direccion_envio}</p>
            <p style="color:#999;font-size:13px">Te avisaremos cuando tu pedido sea despachado.</p>
            <div style="margin:24px 0;text-align:center">
                <a href="${trackingUrl}" style="display:inline-block;background:#a855f7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver estado de mi pedido</a>
            </div>
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
    const trackingUrl = `${FRONTEND_URL}/payment/return?pedidoId=${pedido.id}&token=${encodeURIComponent(pedido.flow_token)}`;

    await sendEmail({
        to: pedido.comprador_email,
        subject: `Tu pedido #${pedido.id} fue enviado — Black Michi Estudio`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7">Tu pedido esta en camino</h2>
            <p>Hola <strong>${pedido.comprador_nombre}</strong>, tu pedido fue despachado.</p>
            ${pedido.numero_seguimiento
                ? `<p>Numero de seguimiento: <strong style="color:#a855f7">${pedido.numero_seguimiento}</strong></p>`
                : ""}
            <p style="color:#999;font-size:13px">Direccion de envio: ${pedido.direccion_envio}</p>
            <div style="margin:24px 0;text-align:center">
                <a href="${trackingUrl}" style="display:inline-block;background:#a855f7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver estado de mi pedido</a>
            </div>
        </div>`
    });
}

export async function emailPedidoEntregado(pedido) {
    const trackingUrl = `${FRONTEND_URL}/payment/return?pedidoId=${pedido.id}&token=${encodeURIComponent(pedido.flow_token)}`;

    await sendEmail({
        to: pedido.comprador_email,
        subject: `Pedido #${pedido.id} entregado — Black Michi Estudio`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7">Pedido entregado</h2>
            <p>Hola <strong>${pedido.comprador_nombre}</strong>, tu pedido fue entregado exitosamente.</p>
            <p>Esperamos que disfrutes tu compra. Si tienes alguna consulta, no dudes en escribirnos.</p>
            <div style="margin:24px 0;text-align:center">
                <a href="${trackingUrl}" style="display:inline-block;background:#a855f7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ver detalle del pedido</a>
            </div>
            <div style="margin:24px 0;text-align:center">
                <a href="${FRONTEND_URL}/productos" style="color:#a855f7;text-decoration:none;font-size:14px">Seguir comprando</a>
            </div>
        </div>`
    });
}

export async function emailBienvenida(nombre, email) {
    await sendEmail({
        to: email,
        subject: `Bienvenido/a a Black Michi Estudio`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
            <h2 style="color:#a855f7">Bienvenido/a, ${nombre}</h2>
            <p>Gracias por registrarte en Black Michi Estudio.</p>
            <p>Somos un estudio de impresion 3D especializado en figuras de cultura pop, anime y ciencia ficcion. Cada pieza es unica y hecha con cuidado.</p>
            <div style="margin:24px 0;text-align:center">
                <a href="${FRONTEND_URL}/productos" style="display:inline-block;background:#a855f7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Explorar productos</a>
            </div>
            <p style="color:#999;font-size:13px">Si tienes dudas, visita nuestras <a href="${FRONTEND_URL}/preguntas-frecuentes" style="color:#a855f7">preguntas frecuentes</a>.</p>
        </div>`
    });
}
