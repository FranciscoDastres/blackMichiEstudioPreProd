import { createClient } from "@supabase/supabase-js";
import db from "../lib/db.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No autorizado" });

  const token = auth.split(" ")[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: "Token inválido" });

    const result = await db.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE auth_id = $1",
      [data.user.id]
    );
    if (!result.rows.length) return res.status(401).json({ error: "Usuario no encontrado" });

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token inválido" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (req.user.rol !== "admin") return res.status(403).json({ error: "Solo admin" });
  next();
}
