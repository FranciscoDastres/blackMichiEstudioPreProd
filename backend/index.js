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

// Render asigna dinámicamente un puerto, usualmente el 10000. 
// Es vital que el servidor escuche en process.env.PORT.
const PORT = process.env.PORT || 10000;

// ✅ ASEGURAR CARPETAS DE UPLOADS (Importante en Docker)
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/hero')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta creada: ${dir}`);
  }
});

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://black-michi-estudio-pre-prod.vercel.app',
  'https://sandbox.flow.cl',
  'https://www.flow.cl'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplicar CORS con excepción para el retorno de Flow si es necesario
app.use((req, res, next) => {
  if (req.path === '/api/payments/flow/return') return next();
  cors(corsOptions)(req, res, next);
});

// ✅ SERVIR ARCHIVOS ESTÁTICOS
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
    else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
    else if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");

    // Crucial para que el Frontend en Vercel pueda leer las imágenes del Backend en Render
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// --- Endpoints de prueba y debug ---
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "BlackMichie Studio API",
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: "Conexión exitosa a la DB",
      timestamp: result.rows[0].now,
      env: {
        database_configured: !!process.env.DATABASE_URL
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error de DB", details: error.message });
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
  console.error(err.stack);
  res.status(500).send({ error: 'Algo salió mal en el servidor' });
});

// ✅ INICIO DEL SERVIDOR (Escuchando en 0.0.0.0 para Docker)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});