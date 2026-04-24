// backend/controllers/paymentController.ts
import { Request, Response } from "express";
import flowService from "../services/flowService.js";
import * as paymentService from "../services/paymentService.js";
import logger from "../lib/logger.js";

export async function createPayment(req: Request, res: Response): Promise<void> {
  const { items, email, nombre, notas, telefono, direccion, cuponCodigo } = req.body;

  if (!process.env.BACKEND_URL) {
    res.status(500).json({ success: false, message: "BACKEND_URL no está configurado." });
    return;
  }
  if (!email || !email.includes("@")) {
    res.status(400).json({ success: false, message: "Email inválido." });
    return;
  }
  if (!nombre || nombre.trim().length < 2) {
    res.status(400).json({ success: false, message: "Nombre inválido." });
    return;
  }
  if (!items || items.length === 0) {
    res.status(400).json({ success: false, message: "El carrito está vacío." });
    return;
  }

  try {
    const result = await paymentService.crearPago({ items, email, nombre, notas, telefono, direccion, cuponCodigo });
    res.json({ success: true, ...result });
  } catch (err: any) {
    logger.error({ err }, "Error creando pago");
    let message = "Error al procesar el pago. Por favor intenta nuevamente.";
    if (err.message?.includes("Flow")) message = "Error al conectar con Flow. Verifica tu conexión.";
    else if (err.message?.includes("database")) message = "Error de base de datos. Por favor intenta más tarde.";
    else if (err.status === 400) message = err.message;

    res.status(err.status || 500).json({
      success: false,
      message,
      ...(err.productos_sin_stock && { productos_sin_stock: err.productos_sin_stock }),
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    });
  }
}

export async function flowReturn(req: Request, res: Response): Promise<void> {
  const token = req.body?.token || req.query?.token;
  logger.info("Usuario retornó de Flow");
  try {
    const pedidoId = await paymentService.getPedidoByFlowToken(token as string);
    if (pedidoId) {
      res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&pedidoId=${pedidoId}`);
      return;
    }
    res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=not_found`);
  } catch (err) {
    logger.error({ err }, "Error en flow/return");
    res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=server`);
  }
}

export async function flowConfirmation(req: Request, res: Response): Promise<void> {
  const token = req.body.token;
  logger.info("Webhook Flow recibido");

  if (!token || typeof token !== "string" || token.length < 8) {
    logger.warn("Token inválido en webhook");
    res.status(400).send("Token required");
    return;
  }

  if (!flowService.validateCallback(req.body)) {
    logger.warn({ ip: req.ip }, "Webhook Flow rechazado: firma inválida");
    res.status(400).send("Invalid signature");
    return;
  }

  try {
    await paymentService.procesarWebhook(token, req.body, req.headers, req.ip || (req.socket?.remoteAddress));
    res.sendStatus(200);
  } catch (err: any) {
    logger.error({ err }, "Error procesando webhook");
    res.sendStatus(err.status === 404 ? 404 : 500);
  }
}

export async function getPedidoStatus(req: Request, res: Response): Promise<void> {
  try {
    const flowToken = req.query.token as string | undefined;
    if (!flowToken) {
      res.status(401).json({ success: false, message: "Token de pago requerido" });
      return;
    }

    const pedido = await paymentService.getEstadoPedido(req.params.pedidoId as string, flowToken) as any;
    if (!pedido) {
      res.status(404).json({ success: false, message: "Pedido no encontrado" });
      return;
    }

    res.json({
      success: true,
      pedido: {
        id:            pedido.id,
        commerceOrder: pedido.commerce_order,
        flowOrder:     pedido.flow_order,
        estado:        pedido.estado,
        total:         pedido.total,
        costoEnvio:    pedido.costo_envio,
        comprador: {
          nombre:   pedido.comprador_nombre,
          email:    pedido.comprador_email,
          telefono: pedido.comprador_telefono,
        },
        direccionEnvio: pedido.direccion_envio,
        notas:          pedido.notas,
        items:          pedido.items,
        fechaCreacion:  pedido.created_at,
        fechaPago:      pedido.fecha_pago,
      },
    });
  } catch (err) {
    logger.error({ err }, "Error obteniendo pedido");
    res.status(500).json({ success: false, error: "Error al obtener el pedido" });
  }
}
