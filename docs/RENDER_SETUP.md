# Guía de Configuración para Render

## 📋 Checklist de Configuración

### 1️⃣ Backend en Render

#### Variables de Entorno (Backend)
Ir a **Render Dashboard → Tu servicio backend → Environment**

Agregar estas variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-frontend.onrender.com
JWT_SECRET=tu_secret_seguro
FLOW_API_KEY=tu_api_key_flow
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
```

#### Health Check
- La ruta de health check debe estar en: `/health`
- El backend debe responder en puerto `3000`

### 2️⃣ Frontend en Render

#### Variables de Entorno (Frontend)
Ir a **Render Dashboard → Tu servicio frontend → Environment**

Agregar esta variable:
```
VITE_API_BASE_URL=https://blackmichi-backend-latest.onrender.com
```

#### Build Command
```bash
npm install && npm run build
```

#### Start Command
```bash
npm run preview
# O si usas servidor web:
# npm install -g serve && serve -s dist -l 3000
```

### 3️⃣ Configuración CORS

El backend ya acepta:
- ✅ Localhost (desarrollo)
- ✅ Render (producción)
- ✅ Origins sin especificar (mobile apps)

### 4️⃣ Troubleshooting

#### Error: "Not allowed by CORS"
**Solución:**
1. Verifica que `FRONTEND_URL` está definido en las variables del backend
2. Verifica que `VITE_API_BASE_URL` está definido en el frontend
3. Reinicia los servicios en Render

#### Las requests son lentas
Render free tier entra en "sleep" después de 15 minutos. Considera upgraar a pago.

#### Logs en Render
1. Ve a **Render Dashboard → Tu servicio**
2. Haz clic en la pestaña **Logs**
3. Filtra por errores

### 5️⃣ URLs de Producción

- **Backend:** https://blackmichi-backend-latest.onrender.com
- **Frontend:** (Depende de tu URL en Render)

### 6️⃣ Verificar que funciona

#### Desde terminal:
```bash
curl -X GET https://blackmichi-backend-latest.onrender.com/health
```

Debe retornar:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-02T11:04:00.000Z",
  "uptime": 12345
}
```

#### Desde el frontend:
Abre consola del navegador (F12) y verifica:
```
🔍 VITE_API_BASE_URL: https://blackmichi-backend-latest.onrender.com
🔍 Final API URL: https://blackmichi-backend-latest.onrender.com/api
```

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

