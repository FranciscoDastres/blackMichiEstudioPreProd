// index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pool = require("./lib/db");

// Importar rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const productosRoutes = require('./routes/productos');
const categoriasRoutes = require('./routes/categorias');
const heroImagesRoutes = require("./routes/heroImages");
const paymentRoutes = require('./routes/payments');
const featuredRoutes = require('./routes/featuredRoutes');
const reviewsRoutes = require('./routes/reviews');

const { requireAuth, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------
// MIDDLEWARE DE LOGGING (para depuración)
// --------------------
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'sin origen'}`);
  console.log(`   User-Agent: ${req.headers['user-agent'] || 'desconocido'}`);
  next();
});

// --------------------
// CONFIGURACIÓN CORS
// --------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost',
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

// En producción, permite cualquier origen (flexible)
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }

    // En desarrollo o si la variable está en whitelist, permitir todo
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Fallback: permitir igual (para evitar errores)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// MIDDLEWARE PRE-FLIGHT: Responder a OPTIONS manualmente como respaldo
app.options('*', cors(corsOptions));

// --------------------
// MIDDLEWARES ADICIONALES
// --------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --------------------
// SERVIR ARCHIVOS ESTÁTICOS
// --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
    else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
    else if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// --------------------
// ENDPOINTS DE PRUEBA
// --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend funcionando correctamente",
    timestamp: new Date().toISOString(),
    status: "online",
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de prueba para verificar que las rutas API funcionan
app.get("/api/test", (req, res) => {
  console.log('🚀 Endpoint /api/test fue llamado correctamente');
  res.json({
    success: true,
    message: 'API endpoint de prueba funcionando',
    cors_origin: req.headers.origin || 'sin origen',
    timestamp: new Date().toISOString()
  });
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
    console.error('❌ Error de base de datos:', error);
    res.status(500).json({
      error: "Error de conexión a la base de datos",
      details: error.message
    });
  }
});

// --------------------
// RUTAS API - CON LOGS
// --------------------
console.log('✅ Endpoints de prueba configurados. Montando rutas API...');

console.log('⏳ Montando /api/auth...');
app.use('/api/auth', authRoutes);

console.log('⏳ Montando /api/productos...');
app.use('/api/productos', productosRoutes);

console.log('⏳ Montando /api/categorias...');
app.use('/api/categorias', categoriasRoutes);

console.log('⏳ Montando /api/hero-images...');
app.use('/api/hero-images', heroImagesRoutes);

console.log('⏳ Montando /api/featured...');
app.use('/api/featured', featuredRoutes);

console.log('⏳ Montando /reviews...');
app.use('/reviews', reviewsRoutes);

console.log('⏳ Montando /api/client...');
app.use('/api/client', requireAuth, clientRoutes);

console.log('⏳ Montando /api/admin...');
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

console.log('⏳ Montando /api/admin/hero-images...');
app.use('/api/admin/hero-images', requireAuth, requireAdmin, heroImagesRoutes);

console.log('⏳ Montando /api/payments...');
app.use('/api/payments', paymentRoutes);

console.log('✅ TODAS LAS RUTAS MONTADAS CORRECTAMENTE');

// --------------------
// MIDDLEWARE PARA RUTAS NO ENCONTRADAS
// --------------------
app.use('*', (req, res) => {
  console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// --------------------
// MIDDLEWARE DE ERRORES GLOBAL
// --------------------
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// --------------------
// START SERVER
// --------------------
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log(`📁 Sirviendo archivos estáticos desde: ${publicPath}`);
  console.log(`📁 Uploads: ${path.join(__dirname, "uploads")}`);
  console.log(`📁 ¿Existe uploads/hero/? ${fs.existsSync(path.join(__dirname, 'uploads/hero')) ? '✅ SÍ' : '❌ NO'}`);
  console.log(`🔒 CORS: MODO ABIERTO - Todas las solicitudes permitidas`);
  console.log(`=================================`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

module.exports = app;