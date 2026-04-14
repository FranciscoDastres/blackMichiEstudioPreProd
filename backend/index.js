// index.js — Black Michi Estudio Backend
import "./instrument.js";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import compression from "compression";
import { fileURLToPath } from "url";
import "dotenv/config";
import logger from "./lib/logger.js";
import db from "./lib/db.js";

import * as keepAlive from "./lib/keepAlive.js";
import * as cleanupJobs from "./lib/cleanupJobs.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import clientRoutes from "./routes/client.js";
import productosRoutes from "./routes/productos.js";
import categoriasRoutes from "./routes/categorias.js";
import heroImagesRoutes from "./routes/heroImages.js";
import paymentRoutes from "./routes/payments.js";
import featuredRoutes from "./routes/featuredRoutes.js";
import reviewsRoutes from "./routes/reviews.js";
import orderRoutes from "./routes/order.js";
import cuponesRoutes from "./routes/cupones.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────
// Evitar doble arranque en Render (CRÍTICO)
// ─────────────────────────────────────────────
if (process.env.RENDER === "true" && process.argv[1] !== __filename) {
  logger.warn("Render detuvo doble instancia");
  process.exit(0);
}

// ─────────────────────────────────────────────
// VALIDAR ENV VARIABLES
// ─────────────────────────────────────────────
const requiredEnvVars = ["DATABASE_URL"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  if (isProd && !process.env.DATABASE_URL) {
    logger.fatal({ missingVars }, "Variables de entorno críticas faltantes");
    process.exit(1);
  }
  logger.warn({ missingVars }, "Variables de entorno faltantes");
}

logger.info("Pool de conexión a BD inicializado");

const app = express();
const PORT = process.env.PORT || 3000;

// Render usa proxy inverso → requerido
app.set("trust proxy", 1);

// ─────────────────────────────────────────────
// HELMET
// ─────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || "";

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProd
      ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
          connectSrc: ["'self'", supabaseUrl, "https://*.supabase.co"].filter(Boolean),
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      }
      : false,
  })
);

// ─────────────────────────────────────────────
// CORS — con patrones y whitelist
// ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PREVIEW,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const VERCEL_PREVIEW_PATTERN =
  /^https:\/\/black-michi-estudio-pre-prod-[a-z0-9]+\.vercel\.app$/;

// Webhooks server-to-server: no pasan por CORS (Flow no es un browser)
const webhookPaths = [
  "/api/payments/flow/confirmation",
  "/api/payments/flow/return",
];

app.use((req, res, next) => {
  if (webhookPaths.includes(req.path)) {
    return next();
  }
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || VERCEL_PREVIEW_PATTERN.test(origin)) {
        return callback(null, true);
      }
      logger.warn({ origin }, "CORS bloqueado");
      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })(req, res, next);
});

// ─────────────────────────────────────────────
// COMPRESIÓN
// ─────────────────────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }));

// ─────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.match(/\.(webp|jpg|jpeg|png|gif|svg)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
  } else if (req.path.match(/\.[a-f0-9]{8}\.(js|css)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "public, max-age=60");
  }
  next();
});

// ─────────────────────────────────────────────
// BODY PARSERS
// ─────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─────────────────────────────────────────────
// SANITIZACIÓN
// ─────────────────────────────────────────────
const DANGEROUS_TAGS = /<\s*(script|iframe|object|embed|link|base|form|meta)[^>]*>/gi;

function sanitizeValue(value) {
  if (typeof value === "string") return value.replace(DANGEROUS_TAGS, "");
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]));
  return value;
}

app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") req.body = sanitizeValue(req.body);
  next();
});

// ─────────────────────────────────────────────
// ARCHIVOS ESTÁTICOS
// ─────────────────────────────────────────────
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
      else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg"))
        res.setHeader("Content-Type", "image/jpeg");
      else if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");

      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// ─────────────────────────────────────────────
// ENDPOINTS BASE
// ─────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.get("/api/health", async (req, res) => {
  const startedAt = Date.now();
  const checks = { database: { status: "unknown" } };
  let allHealthy = true;

  try {
    const t0 = Date.now();
    await db.query("SELECT 1");
    checks.database = { status: "ok", latencyMs: Date.now() - t0 };
  } catch (err) {
    allHealthy = false;
    checks.database = { status: "error", error: isProd ? "db_unavailable" : err.message };
  }

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - startedAt,
    checks,
  });
});

// ─────────────────────────────────────────────
// SEO: SITEMAP + ROBOTS
// ─────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || "https://blackmichiestudio.cl";

app.get("/sitemap.xml", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, updated_at FROM productos WHERE activo = true ORDER BY updated_at DESC"
    );
    const catResult = await db.query("SELECT id, nombre FROM categorias ORDER BY nombre");

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/productos", priority: "0.9", changefreq: "daily" },
      { loc: "/faq", priority: "0.4", changefreq: "monthly" },
      { loc: "/privacidad", priority: "0.3", changefreq: "yearly" },
      { loc: "/terminos", priority: "0.3", changefreq: "yearly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${FRONTEND_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    for (const row of result.rows) {
      const lastmod = row.updated_at
        ? new Date(row.updated_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      xml += `  <url>
    <loc>${FRONTEND_URL}/producto/${row.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    for (const cat of catResult.rows) {
      xml += `  <url>
    <loc>${FRONTEND_URL}/categoria/${encodeURIComponent(cat.nombre)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    logger.error({ err }, "Error generando sitemap");
    res.status(500).send("Error generando sitemap");
  }
});

app.get("/robots.txt", (req, res) => {
  const backendUrl = process.env.BACKEND_URL || "https://api.blackmichiestudio.cl";
  res.set("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${backendUrl}/sitemap.xml
`);
});

// ─────────────────────────────────────────────
// RATE LIMITERS
// ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiados intentos. Espera 15 minutos." },
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos de pago." },
});

const reviewsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Demasiadas reseñas." },
});

// ─────────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────────
try {
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/productos", productosRoutes);
  app.use("/api/categorias", categoriasRoutes);
  app.use("/api/hero-images", heroImagesRoutes);
  app.use("/api/featured", featuredRoutes);
  app.use("/api/reviews", reviewsLimiter, reviewsRoutes);
  app.use("/api/cupones", cuponesRoutes);
  app.use("/api/client", requireAuth, clientRoutes);
  app.use("/api/payments/flow/create", paymentLimiter);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/orders", requireAuth, orderRoutes);
  app.use("/api/admin", requireAuth, requireAdmin, adminRoutes);

  logger.info("Todas las rutas montadas correctamente");
} catch (error) {
  logger.error({ err: error }, "Error al montar rutas");
}

// ─────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────
app.use("*", (req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ─────────────────────────────────────────────
// SENTRY ERROR HANDLER (antes del global)
// ─────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ─────────────────────────────────────────────
// ERROR GLOBAL
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: "Origen no permitido" });
  }
  logger.error({ err, method: req.method, url: req.originalUrl }, "Error global");
  res.status(err.status || 500).json({ error: isProd ? "Error interno" : err.message });
});

// ─────────────────────────────────────────────
// INICIAR SERVIDOR — FIX RENDER
// ─────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV, cors: allowedOrigins }, "Servidor iniciado");
  cleanupJobs.start();
});

// keepAlive SOLO en local
if (!process.env.RENDER) {
  keepAlive.start();
}

// ─────────────────────────────────────────────
// MANEJO DE SALIDA
// ─────────────────────────────────────────────
process.on("SIGTERM", () => {
  server.close(() => {
    logger.info("Servidor cerrado");
    process.exit(0);
  });
});

export default app;
