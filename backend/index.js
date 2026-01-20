const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pool = require("./lib/db");
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const productosRoutes = require('./routes/productos');
const categoriasRouter = require('./routes/categorias');
const heroImagesRoutes = require("./routes/heroImages");
const paymentRoutes = require('./routes/payments');
const featuredRoutes = require('./routes/featuredRoutes');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ DEFINIR RUTAS ABSOLUTAS
const UPLOADS_PATH = path.resolve(__dirname, "uploads");

// ✅ ASEGURAR CARPETAS DE UPLOADS
const uploadDirs = [
  UPLOADS_PATH,
  path.join(UPLOADS_PATH, 'hero')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta asegurada: ${dir}`);
  }
});

// ✅ CONFIGURACIÓN DE CORS FLEXIBLE PARA VERCEL
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://black-michi-estudio-pre-prod.vercel.app',
  'https://sandbox.flow.cl',
  'https://www.flow.cl'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir si no hay origen (como Postman) o si es un dominio permitido
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("⚠️ Intento de acceso bloqueado por CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares base
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SERVIR ARCHIVOS ESTÁTICOS (CRUCIAL PARA RENDER)
// Usamos path.resolve para evitar errores de ruta en Linux
app.use("/uploads", express.static(UPLOADS_PATH, {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache de 1 año para fotos
  }
}));

// Servir carpeta public si existe
const publicPath = path.resolve(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// --- Endpoints de Debug ---
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "BlackMichie Studio API",
    environment: process.env.NODE_ENV || 'production',
    uploads_path: UPLOADS_PATH,
    uploads_exists: fs.existsSync(UPLOADS_PATH)
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "DB Conectada", timestamp: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: "Error DB", details: error.message });
  }
});

// --- Rutas de API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);
app.use('/api/client', requireAuth, clientRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRouter);
app.use('/api/payments', paymentRoutes);
app.use("/api/featured", featuredRoutes);
app.use("/api/admin/hero-images", heroImagesRoutes);
app.use("/api/hero-images", heroImagesRoutes);
app.use('/reviews', reviewsRoutes);

// ✅ MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).send({ error: 'Algo salió mal en el servidor' });
});

// ✅ INICIO DEL SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log(`📂 Ruta de uploads configurada en: ${UPLOADS_PATH}`);
});