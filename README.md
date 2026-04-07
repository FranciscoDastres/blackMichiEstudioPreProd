# Black Michi Estudio

E-commerce de impresiones 3D (Chile) — React + Vite frontend, Express backend, PostgreSQL, Supabase auth, Cloudinary, Flow (pagos).

## Estructura

```
.
├── backend/              Express API
│   ├── controllers/      HTTP handlers (solo I/O)
│   ├── services/         Lógica de negocio
│   ├── routes/           Definición de rutas Express
│   ├── middleware/       auth, upload
│   ├── lib/              db pool, keepAlive, cleanupJobs
│   ├── utils/            validators
│   ├── db/               Schema base (01-06_*.sql) + migrations/
│   │   ├── migrations/   Migraciones incrementales
│   │   └── scripts/      Scripts SQL de mantenimiento
│   └── scripts/          Scripts Node/Bash (resetAdmin, reprocesar imágenes)
├── frontend/             React + Vite SPA
│   └── src/
│       ├── pages/        Páginas públicas
│       ├── admin/        Panel admin
│       ├── user/         Área de cuenta
│       ├── components/
│       ├── contexts/     Auth, Cart
│       └── services/     api.js
├── scripts/              Scripts de instalación/setup del proyecto
├── docs/                 Documentación (setup, optimizaciones, deploy)
├── nginx/                Configuración nginx para producción
└── docker-compose.yml    Entorno local
```

## Arranque local

```bash
npm install
npm run dev        # levanta frontend + backend + ngrok en paralelo
```

Sin ngrok:

```bash
npm run frontend   # solo frontend
npm run backend    # solo backend
```

## Documentación

- [docs/RENDER_SETUP.md](docs/RENDER_SETUP.md) — Deploy en Render
- [docs/OPTIMIZACIONES.md](docs/OPTIMIZACIONES.md) — Optimizaciones de rendimiento aplicadas
- [docs/git_example.md](docs/git_example.md) — Referencia de convención de commits

## Scripts útiles

```bash
# Instalación completa (requiere sudo, instala Postgres, Node, deps)
bash scripts/instalacion.sh

# Solo dependencias
bash scripts/install-optimizations.sh

# Inicializar DB (requiere DB_PASS como env var)
DB_PASS="tu-password" bash scripts/init_db.sh

# Convertir imágenes a WebP
bash scripts/convertImgToWebp.sh

# Resetear password de admin (requiere env var)
ADMIN_RESET_PASSWORD="nueva-pass-segura" node backend/scripts/resetAdmin.js
```
