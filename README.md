# Black Michi Estudio

E-commerce fullstack para servicios de impresión 3D personalizada. Incluye tienda pública, panel de administración completo y área privada de usuario.

> **Demo:** https://black-michi-estudio-pre-prod.vercel.app/  
> **Stack:** React · Node.js · PostgreSQL · Supabase · Cloudinary · Docker

---

## Funcionalidades

### Tienda pública
- Catálogo con filtros, búsqueda y paginación
- Detalle de producto con galería de imágenes y reseñas verificadas
- Carrito persistente con Context API
- Checkout con validación completa y pago vía **Flow** (pasarela chilena)
- Cupones de descuento
- Lista de favoritos por usuario
- Hero carousel configurable desde el panel admin

### Panel de administración
- Dashboard con métricas en tiempo real (ventas, pedidos, usuarios)
- CRUD de productos con subida de imágenes a **Cloudinary**
- Gestión de pedidos con cambio de estado
- Gestión de cupones de descuento
- Configuración de hero sections (imagen, texto, categoría)

### Área de usuario
- Perfil editable y cambio de contraseña
- Historial de pedidos con detalle y descarga de recibo en **PDF**
- Reseñas de productos comprados
- Favoritos guardados

### Autenticación
- Registro / login con email y contraseña (Supabase)
- Login con **Google OAuth**
- Recuperación de contraseña por email
- Rutas protegidas por rol (admin / cliente)

---

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Base de datos | PostgreSQL (con migraciones automáticas al arrancar) |
| Auth | Supabase Auth + Google OAuth |
| Storage | Cloudinary |
| Pagos | Flow (Chile) |
| Infraestructura | Docker, Docker Compose, Nginx |
| Deploy | Render (backend) + Vercel (frontend) |
| Observabilidad | Sentry, Pino (logging estructurado) |
| Testing | Vitest, Testing Library |

---

## Arquitectura

```
blackMichiEstudio/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── admin/     # Panel de administración (rutas protegidas por rol)
│       ├── user/      # Área privada del usuario
│       ├── pages/     # Páginas públicas
│       ├── components/
│       ├── contexts/  # CartContext, AuthContext, FavoritesContext
│       ├── hooks/
│       └── services/  # Axios API client
├── backend/           # Express REST API
│   ├── controllers/   # HTTP handlers (solo I/O)
│   ├── services/      # Lógica de negocio
│   ├── routes/
│   ├── middleware/    # Auth, upload, rate limiting
│   └── lib/           # Pool DB, logger, migraciones, keepAlive
├── nginx/             # Reverse proxy
├── docker-compose.yml
└── docker-compose.prod.yml
```

---

## Instalación local

### Requisitos
- Node.js 20+
- Docker y Docker Compose

### Con Docker (recomendado)

```bash
git clone https://github.com/FranciscoDastres/blackMichiEstudio.git
cd blackMichiEstudio

# Copiar y completar variables de entorno
cp backend/.env.example backend/.env

docker compose up -d
```

App disponible en `http://localhost`

### Sin Docker

```bash
# Instalar todo y levantar frontend + backend
npm install
npm run dev
```

O por separado:

```bash
npm run frontend   # solo frontend (puerto 5173)
npm run backend    # solo backend (puerto 3000)
```

---

## Variables de entorno

`backend/.env`:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/blackmichiestudio

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# Flow (pagos)
FLOW_API_KEY=xxxx
FLOW_SECRET_KEY=xxxx
FLOW_API_URL=https://sandbox.flow.cl/api

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=xxxx
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

---

## Scripts útiles

```bash
# Inicializar DB
DB_PASS="password" bash scripts/init_db.sh

# Convertir imágenes a WebP
bash scripts/convertImgToWebp.sh

# Resetear contraseña de admin
ADMIN_RESET_PASSWORD="nueva-pass" node backend/scripts/resetAdmin.js
```

---

## Deploy

**Backend → Render**
- Root directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Configurar variables de entorno en el dashboard de Render

**Frontend → Vercel**
- Root directory: `frontend`
- Build: `npm run build`
- Output: `dist`

Más detalles en [docs/RENDER_SETUP.md](docs/RENDER_SETUP.md)

---

## Autor

**Francisco Meza Dastres** — Ingeniero Informático | Full Stack Developer  
[LinkedIn](https://www.linkedin.com/in/francisco-meza-dastres/) · [GitHub](https://github.com/FranciscoDastres)
