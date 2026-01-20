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
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1',
  'https://sandbox.flow.cl',
  'https://www.flow.cl'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplicar CORS excepto retorno Flow
app.use((req, res, next) => {
  if (req.path === '/api/payments/flow/return') return next();
  cors(corsOptions)(req, res, next);
});

// ✅ SERVIR ARCHIVOS ESTÁTICOS (SOLO UNA VEZ)
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".webp")) {
      res.setHeader("Content-Type", "image/webp");
    } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (filePath.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    }
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Endpoints de prueba y debug
app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando correctamente", timestamp: new Date().toISOString() });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: "Conexión a la base de datos exitosa",
      timestamp: result.rows[0].now,
      dbConfig: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Error de conexión a la base de datos",
      details: error.message
    });
  }
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);
app.use('/api/client', requireAuth, clientRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRouter);
app.use('/api/payments', paymentRoutes);
app.use("/api/featured", featuredRoutes);
app.use("/api/admin/hero-images", heroImagesRoutes);
app.use("/api/hero-images", require("./routes/heroImages"));
app.use('/reviews', reviewsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos estáticos desde: ${publicPath}`);
  console.log(`📁 Uploads: ${path.join(__dirname, "uploads")}`);
  console.log(`📁 ¿Existe uploads/hero/? ${fs.existsSync(path.join(__dirname, 'uploads/hero')) ? '✅ SÍ' : '❌ NO'}`);
});