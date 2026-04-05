// index.js — Black Michi Estudio Backend
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const keepAlive = require("./lib/keepAlive");
const cleanupJobs = require("./lib/cleanupJobs");

const isProd = process.env.NODE_ENV === "production";

const requiredEnvVars = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`⚠️  Variables faltantes: ${missingVars.join(", ")}`);
  console.warn("⚠️  Usando DATABASE_URL si está disponible...");
}

let pool;
try {
  pool = require("./lib/db");
  console.log("✅ Pool de conexión a BD inicializado");
} catch (error) {
  console.error("❌ Error al cargar la BD:", error.message);
}

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const clientRoutes = require("./routes/client");
const productosRoutes = require("./routes/productos");
const categoriasRoutes = require("./routes/categorias");
const heroImagesRoutes = require("./routes/heroImages");
const paymentRoutes = require("./routes/payments");
const featuredRoutes = require("./routes/featuredRoutes");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");
const orderRoutes = require("./routes/order");
const { requireAuth, requireAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// HELMET + CSP
// ─────────────────────────────────────────────
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const supabaseUrl = process.env.SUPABASE_URL || "";

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc:     ["'self'"],
            scriptSrc:      ["'self'"],
            styleSrc:       ["'self'", "'unsafe-inline'"],
            imgSrc:         ["'self'", "data:", "https://res.cloudinary.com"],
            fontSrc:        ["'self'"],
            connectSrc:     ["'self'", supabaseUrl, "https://*.supabase.co"].filter(Boolean),
            frameSrc:       ["'none'"],
            objectSrc:      ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
  })
);

// ─────────────────────────────────────────────
// CORS — restringido excepto webhooks server-to-server
// ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

// Rutas de webhook — son server-to-server, no necesitan CORS
const webhookPaths = [
  "/api/payments/flow/confirmation",
  "/api/payments/flow/return",
];

app.use((req, res, next) => {
  if (webhookPaths.includes(req.path)) {
    return next();
  }

  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
  })(req, res, next);
});

// ─────────────────────────────────────────────
// COMPRESIÓN
// ─────────────────────────────────────────────
const compression = require("compression");
app.use(compression({ level: 6, threshold: 1024 }));

// ─────────────────────────────────────────────
// CACHE HEADERS
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.match(/\.(webp|jpg|jpeg|png|gif|svg)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
  } else if (req.path.match(/\.[a-f0-9]{8}\.(js|css)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (
    req.path.startsWith("/api/admin") ||
    req.path.startsWith("/api/client") ||
    req.path.startsWith("/api/users") ||
    req.path.startsWith("/api/orders")
  ) {
    res.setHeader("Cache-Control", "no-store, no-cache, private");
  } else if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "public, max-age=300");
  }
  next();
});

// ─────────────────────────────────────────────
// LOGGING — solo en desarrollo
// ─────────────────────────────────────────────
if (!isProd) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─────────────────────────────────────────────
// BODY PARSERS
// ─────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─────────────────────────────────────────────
// SANITIZACIÓN BÁSICA DE INPUTS
// Recorre strings del body y elimina tags HTML peligrosos
// React escapa por defecto, pero bloqueamos en la fuente
// ─────────────────────────────────────────────
const DANGEROUS_TAGS = /<\s*(script|iframe|object|embed|link|base|form|meta)[^>]*>/gi;

function sanitizeValue(value) {
  if (typeof value === "string") {
    return value.replace(DANGEROUS_TAGS, "");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  return value;
}

app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
});

// ─────────────────────────────────────────────
// ARCHIVOS ESTÁTICOS
// ─────────────────────────────────────────────
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

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

const publicPath = path.join(__dirname, "public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// ─────────────────────────────────────────────
// ENDPOINTS BASE
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

if (!isProd) {
  app.get("/test-db", async (req, res) => {
    if (!pool) {
      return res.status(503).json({ error: "Pool de BD no inicializado" });
    }
    try {
      const result = await pool.query("SELECT NOW()");
      res.json({
        message: "Conexión a la base de datos exitosa",
        timestamp: result.rows[0].now,
      });
    } catch (error) {
      res.status(500).json({ error: "Error de conexión", details: error.message });
    }
  });

  app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "API de prueba funcionando" });
  });
}

// ─────────────────────────────────────────────
// RUTAS API
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: "Demasiados intentos. Espera 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5,
  message: { error: "Demasiados intentos de pago. Espera 10 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Config pública de la tienda (nombre, costo envío, moneda)
app.get("/api/config", async (req, res) => {
  try {
    const result = await pool.query("SELECT clave, valor FROM configuracion");
    const config = Object.fromEntries(result.rows.map(r => [r.clave, r.valor]));
    res.json(config);
  } catch {
    res.json({ costo_envio: "3500", moneda: "CLP" });
  }
});

try {
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/productos", productosRoutes);
  app.use("/api/categorias", categoriasRoutes);
  app.use("/api/hero-images", heroImagesRoutes);
  app.use("/api/featured", featuredRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/client", requireAuth, clientRoutes);
  app.use("/api/payments/flow/create", paymentLimiter);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/orders", requireAuth, orderRoutes);
  app.use("/api/admin", requireAuth, requireAdmin, adminRoutes);
  app.use("/api/admin/hero-images", requireAuth, requireAdmin, heroImagesRoutes);
  app.use("/api/users", requireAuth, requireAdmin, usersRoutes);

  console.log("✅ Todas las rutas montadas correctamente");
} catch (error) {
  console.error("❌ Error al montar rutas:", error);
}

// ─────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ─────────────────────────────────────────────
// ERROR GLOBAL
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: "Origen no permitido" });
  }
  console.error("❌ Error global:", err.message);
  res.status(err.status || 500).json({
    error: isProd ? "Error interno del servidor" : err.message,
    ...(!isProd && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────
// INICIAR SERVIDOR
// ─────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log(`🔒 CORS restringido a: ${allowedOrigins.join(", ")}`);
  console.log(`🛡️  Helmet activo`);
  console.log(`📦 Entorno: ${process.env.NODE_ENV || "development"}`);

  if (isProd || process.env.RENDER) {
    keepAlive.start();
  }
  cleanupJobs.start();
}).on("error", (err) => {
  console.error("❌ Error al iniciar el servidor:", err);
  process.exit(1);
});

// ─────────────────────────────────────────────
// CIERRE GRACEFUL
// ─────────────────────────────────────────────
process.on("SIGTERM", () => {
  keepAlive.stop();
  server.close(() => {
    console.log("✅ Servidor cerrado");
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("❌ Excepción no capturada:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Promesa rechazada:", reason);
});

module.exports = app;