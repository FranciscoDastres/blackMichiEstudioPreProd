# Deploy a producción

Guía de despliegue para Black Michi Estudio. Usar con `docker-compose.prod.yml`.

## 1. Prerequisitos del servidor

- Docker Engine 24+ y Docker Compose v2
- Puertos 80 y 443 abiertos al público
- DNS apuntando al servidor (registros A/AAAA para `tudominio.com` y `www.tudominio.com`)
- Usuario con permisos de `docker` y `sudo`

## 2. Primera vez

```bash
# Clonar
git clone <repo> /opt/blackmichiestudio
cd /opt/blackmichiestudio

# Configurar envs
cp .env.production.example .env
cp backend/.env.example backend/.env      # si existe; si no, crear manualmente
nano .env                                  # rellenar VITE_*, VITE_SUPABASE_*, etc.
nano backend/.env                          # DATABASE_URL, SUPABASE_*, CLOUDINARY_*, FLOW_*

# Emitir certificados Let's Encrypt (una sola vez)
DOMAINS="tudominio.com www.tudominio.com" \
EMAIL="tu@email.com" \
  bash scripts/init-letsencrypt.sh

# Primer up completo
bash scripts/deploy.sh
```

## 3. Ajustar dominio en nginx

Antes de ejecutar `init-letsencrypt.sh`, editar `nginx/nginx.prod.conf` y reemplazar
`tudominio.com` por el dominio real en las directivas `server_name`, `ssl_certificate`,
`ssl_certificate_key` y `ssl_trusted_certificate`.

## 4. Deploys siguientes

- **Automático**: push a `main` → GitHub Actions corre `.github/workflows/deploy.yml`.
- **Manual**: `bash scripts/deploy.sh` desde el servidor.

## 5. Secrets de GitHub Actions requeridos

| Secret | Descripción |
|---|---|
| `SSH_HOST` | IP o host del servidor |
| `SSH_USER` | Usuario SSH |
| `SSH_PRIVATE_KEY` | Clave privada SSH (formato OpenSSH) |
| `DEPLOY_PATH` | Ruta absoluta al proyecto en el servidor |
| `VITE_API_URL` | URL pública del backend |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `VITE_SENTRY_DSN` | DSN de Sentry (frontend) — opcional |
| `VITE_PLAUSIBLE_DOMAIN` | Dominio configurado en Plausible — opcional |

## 6. Verificación post-deploy

```bash
# Healthcheck plano (nginx)
curl https://tudominio.com/health

# Healthcheck backend (BD incluida)
curl https://tudominio.com/api/health

# Estado de contenedores
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Logs en vivo
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f --tail=200
```

Todos los servicios deben mostrar `healthy` en `ps`.

## 7. Rollback rápido

```bash
cd /opt/blackmichiestudio
git log --oneline -n 10
git checkout <commit-anterior>
bash scripts/deploy.sh
```

## 8. Renovación de certificados

El contenedor `certbot` corre `certbot renew` cada 12 h automáticamente. No se requiere cron manual.
Verificar expiración:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "" certbot \
  certbot certificates
```

## 9. Troubleshooting

| Síntoma | Causa probable |
|---|---|
| `VITE_API_URL is required` al build | Falta `.env` en raíz o falta exportar la variable |
| Nginx 502 en `/api/` | Backend no arrancó — revisar `docker compose logs backend` |
| TLS con nombre de dominio dummy | Reemplazar `tudominio.com` en `nginx.prod.conf` |
| `certbot` falla en primer arranque | DNS no resuelve aún o puerto 80 bloqueado |
| Backend healthcheck falla | `DATABASE_URL` mal o red a Supabase bloqueada |
