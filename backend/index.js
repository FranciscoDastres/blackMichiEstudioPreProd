// index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ✅ KEEP-ALIVE PARA RENDER
const keepAlive = require("./lib/keepAlive");

// ✅ VERIFICAR VARIABLES DE ENTORNO CRÍTICAS
console.log('\n🔍 Verificando configuración...');
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`⚠️ Variables de entorno faltantes: ${missingVars.join(', ')}`);
  console.warn('⚠️ Usando DATABASE_URL si está disponible...');
}

// ✅ VERIFICAR VARIABLES PARA FLOW Y URLS
console.log('\n🔍 Variables de entorno críticas:');
console.log('  ✓ BACKEND_URL:', process.env.BACKEND_URL || '❌ NO CONFIGURADO');
console.log('  ✓ FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NO CONFIGURADO');
console.log('  ✓ FLOW_API_KEY:', process.env.FLOW_API_KEY ? '✓ Configurado' : '❌ NO CONFIGURADO');
console.log('  ✓ FLOW_SECRET_KEY:', process.env.FLOW_SECRET_KEY ? '✓ Configurado' : '❌ NO CONFIGURADO');
console.log('  ✓ FLOW_ENV:', process.env.FLOW_ENV || 'sandbox (default)');

// ✅ CONEXIÓN A BD CON MEJOR MANEJO
let pool;
try {
  pool = require("./lib/db");
  console.log('✅ Pool de conexión a BD inicializado');
} catch (error) {
  console.error('❌ Error al cargar la BD:', error.message);
  console.error('La aplicación intentará continuar sin BD inicial...');
}

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
const usersRoutes = require('./routes/users');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const orderRoutes = require('./routes/order');
const app = express();
// 🔥 IMPORTANTE: Render asigna el puerto dinámicamente via PORT env var
// NO USAR PUERTO FIJO EN RENDER
const PORT = process.env.PORT || 3000;

// 🔥🔥🔥 VERIFICACIÓN DE VERSIÓN - SOLO PARA DEBUG 🔥🔥🔥
console.log('\n\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                    🚀 BACKEND INICIADO 🚀                  ║');
console.log('║                   VERSIÓN: CORS ULTRA 2.0                 ║');
console.log('║              Todos los orígenes permitidos ✅              ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n');

// --------------------
// 🔥 CORS: PERMITIR ABSOLUTAMENTE TODO
// --------------------
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';

  // Enviar headers CORS
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  console.log(`✅ CORS enviado para origin: ${origin}`);

  // OPTIONS siempre retorna 200
  if (req.method === 'OPTIONS') {
    console.log(`✅ OPTIONS preflight respondido para: ${req.path}`);
    return res.sendStatus(200);
  }

  next();
});

// Doble middleware CORS como respaldo
app.use(cors({ origin: '*', credentials: false }));

// ✅ COMPRESIÓN GZIP - REDUCE TAMAÑO DE RESPUESTAS
const compression = require('compression');
app.use(compression({
  level: 6, // Balance entre velocidad y compresión
  threshold: 1024 // Solo comprimir si es mayor a 1KB
}));

// ✅ CACHE HEADERS - CACHEAR RECURSOS ESTÁTICOS
app.use((req, res, next) => {
  // Cachear imágenes por 30 días
  if (req.path.match(/\.(webp|jpg|jpeg|png|gif|svg)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
  // Cachear bundles (tienen hash en nombre)
  else if (req.path.match(/\.[a-f0-9]{8}\.(js|css)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cachear datos de API por 5 minutos
  else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  next();
});

// --------------------
// MIDDLEWARE DE LOGGING (para depuración)
// --------------------
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'sin origen'}`);
  console.log(`   CORS permitido: ✅ SÍ (TODOS)`);
  next();
});

// --------------------
// MIDDLEWARES ADICIONALES
// --------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --------------------
// SERVIR ARCHIVOS ESTÁTICOS
// --------------------
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  console.warn(`⚠️ Carpeta uploads no existe, creando: ${uploadsPath}`);
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
    else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
    else if (filePath.endsWith(".png")) res.setHeader("Content-Type", "image/png");

    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));

const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else {
  console.warn(`⚠️ Carpeta public no existe en: ${publicPath}`);
}

// --------------------
// ENDPOINTS DE PRUEBA
// --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend funcionando correctamente",
    timestamp: new Date().toISOString(),
    status: "online",
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
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
  if (!pool) {
    return res.status(503).json({
      error: "Pool de BD no inicializado",
      message: "Verifica las variables de entorno",
      vars_configured: {
        has_DATABASE_URL: !!process.env.DATABASE_URL,
        has_DB_HOST: !!process.env.DB_HOST,
        has_SUPABASE_URL: !!process.env.SUPABASE_URL
      }
    });
  }

  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: "✅ Conexión a la base de datos exitosa",
      timestamp: result.rows[0].now,
      connection_type: process.env.SUPABASE_URL ? "Supabase PostgreSQL" : "PostgreSQL Standard",
      dbConfig: {
        host: process.env.DB_HOST || process.env.SUPABASE_URL || 'no configurado',
        database: process.env.DB_NAME || 'no configurado',
        user: process.env.DB_USER || 'no configurado',
        hasPassword: !!process.env.DB_PASSWORD,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        supabase_configured: {
          url: !!process.env.SUPABASE_URL,
          anon_key: !!process.env.SUPABASE_ANON_KEY,
          service_key: !!process.env.SUPABASE_SERVICE_KEY
        }
      }
    });
  } catch (error) {
    console.error('❌ Error de base de datos:', error);
    res.status(500).json({
      error: "❌ Error de conexión a la base de datos",
      details: error.message,
      hint: "Verifica DATABASE_URL o las variables DB_HOST, DB_NAME, DB_USER, DB_PASSWORD en Render Environment",
      configured_vars: {
        DATABASE_URL: process.env.DATABASE_URL ? "✓ Configurado" : "✗ Falta",
        DB_HOST: process.env.DB_HOST ? "✓ Configurado" : "✗ Falta",
        DB_NAME: process.env.DB_NAME ? "✓ Configurado" : "✗ Falta",
        DB_USER: process.env.DB_USER ? "✓ Configurado" : "✗ Falta",
        SUPABASE_URL: process.env.SUPABASE_URL ? "✓ Configurado" : "✗ Falta"
      }
    });
  }
});

// --------------------
// RUTAS API - CON LOGS
// --------------------
console.log('✅ Endpoints de prueba configurados. Montando rutas API...');

try {
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

  console.log('⏳ Montando /api/reviews...');
  app.use('/api/reviews', reviewsRoutes);

  console.log('⏳ Montando /api/client...');
  app.use('/api/client', requireAuth, clientRoutes);

  console.log('⏳ Montando /api/admin...');
  app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);

  console.log('⏳ Montando /api/admin/hero-images...');
  app.use('/api/admin/hero-images', requireAuth, requireAdmin, heroImagesRoutes);

  console.log('⏳ Montando /api/payments...');
  app.use('/api/payments', paymentRoutes);

  // ✅ AQUÍ, dentro del try
  console.log('⏳ Montando /api/users...');
  app.use('/api/users', requireAuth, requireAdmin, usersRoutes);
  console.log('⏳ Montando /api/orders...');
  app.use('/api/orders', orderRoutes);
  console.log('✅ TODAS LAS RUTAS MONTADAS CORRECTAMENTE');
} catch (error) {
  console.error('❌ Error al montar rutas:', error);
  console.error('El servidor continuará pero algunas rutas pueden no estar disponibles');
}


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
  console.log(`📁 Uploads: ${uploadsPath}`);
  console.log(`📁 ¿Existe uploads/hero/? ${fs.existsSync(path.join(__dirname, 'uploads/hero')) ? '✅ SÍ' : '❌ NO'}`);
  console.log(`🔒 CORS: MODO ABIERTO - Todas las solicitudes permitidas`);
  console.log(`📊 Node.js: ${process.version}`);
  console.log(`=================================`);

  // ✅ INICIAR KEEP-ALIVE PARA RENDER
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    keepAlive.start();
  }
}).on('error', (err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Puerto ${PORT} ya está en uso`);
  }
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  keepAlive.stop();
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.error('Promise:', promise);
});

module.exports = app;
