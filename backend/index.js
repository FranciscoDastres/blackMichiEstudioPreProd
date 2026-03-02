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
// CONFIGURACIÓN CORS MEJORADA
// --------------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://sandbox.flow.cl',
  'https://www.flow.cl'
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Permitir peticiones sin origen (Postman, curl, etc.)
    if (!origin) {
      console.log('✅ Petición sin origen permitida');
      return callback(null, true);
    }

    // 2. Permitir TODOS los dominios de Vercel (producción y previews)
    if (origin.includes('.vercel.app')) {
      console.log(`✅ Origen Vercel permitido: ${origin}`);
      return callback(null, true);
    }

    // 3. Permitir dominios de la lista blanca
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ Origen permitido (lista blanca): ${origin}`);
      return callback(null, true);
    }

    // 4. Bloquear cualquier otro origen
    console.log(`❌ Origen bloqueado: ${origin}`);
    callback(new Error(`Origen ${origin} no permitido por CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 200
}));

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
    // Configurar Content-Type según extensión
    if (filePath.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
    else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
    else if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");

    // Permitir acceso cross-origin a imágenes
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// --------------------
// ENDPOINTS DE PRUEBA (verificar que el backend funciona)
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

// ✅ NUEVO ENDPOINT DE PRUEBA PARA VERIFICAR QUE LAS RUTAS API FUNCIONAN
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

// ✅ LOG PARA VERIFICAR QUE LLEGAMOS A LA SECCIÓN DE RUTAS
console.log('✅ Endpoints de prueba configurados. Ahora montando rutas API...');

// --------------------
// RUTAS API - CON LOGS INDIVIDUALES
// --------------------
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
  console.log(`🔒 CORS permitidos: todos los dominios .vercel.app y lista blanca`);
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