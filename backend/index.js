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

// ✅ CARPETAS DE UPLOADS
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/hero')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ CONFIGURACIÓN DE CORS ACTUALIZADA
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://black-michi-estudio-pre-prod.vercel.app',
  // Esta es la URL de tu error, agrégala para que no te bloquee:
  'https://black-michi-estudio-pre-prod-git-main-franciscodastres-projects.vercel.app',
  'https://sandbox.flow.cl',
  'https://www.flow.cl'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir si no hay origen (como el server mismo) o si está en la lista
    // También permitimos cualquier subdominio de .vercel.app para evitar errores en despliegues futuros
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log("CORS bloqueado para:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ APLICAR CORS ANTES QUE TODO
app.use(cors(corsOptions));

// ✅ SERVIR ARCHIVOS ESTÁTICOS (Mejorado para producción)
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permite que cualquier sitio vea las fotos
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    if (filePath.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
    else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) res.setHeader("Content-Type", "image/jpeg");
  }
}));

// Rutas de API... (Resto del código igual)
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "BlackMichie Studio API",
    environment: process.env.NODE_ENV || 'production'
  });
});

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Algo salió mal en el servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto: ${PORT}`);
});