#!/usr/bin/env bash
# ─── deploy.sh ──────────────────────────────────────────────────────────────
# Deploy manual desde el servidor de producción.
# Útil para deploys fuera del flujo de GitHub Actions.
#
# Uso (desde la raíz del proyecto en el servidor):
#   bash scripts/deploy.sh
set -euo pipefail

log()  { echo -e "\n\033[1;32m==>\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
die()  { echo -e "\033[1;31m[ERROR]\033[0m $*" >&2; exit 1; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

[[ -f .env ]] || die "Falta .env en la raíz (usa .env.production.example)"
[[ -f backend/.env ]] || die "Falta backend/.env"

log "Pulling último código ..."
git pull origin main

log "Build + up de contenedores ..."
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build --remove-orphans

log "Esperando healthchecks (20s) ..."
sleep 20

log "Estado de servicios:"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

log "Limpiando imágenes no usadas ..."
docker image prune -f

log "✅ Deploy completo. Revisa logs con:"
echo "   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f --tail=100"
