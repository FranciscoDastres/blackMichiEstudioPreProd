import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import db from "../lib/db.js";
import logger from "../lib/logger.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const token = auth.split(" ")[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    const result = await db.query(
      "SELECT id, nombre, email, rol, auth_id, telefono, direccion_defecto FROM usuarios WHERE auth_id = $1",
      [data.user.id]
    );

    if (!result.rows.length) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    logger.error({ err }, "Error validando token");
    res.status(401).json({ error: "Token inválido" });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  if (req.user.rol !== "admin") {
    res.status(403).json({ error: "Solo admin" });
    return;
  }
  next();
}
