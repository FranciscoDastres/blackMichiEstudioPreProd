#!/usr/bin/env bash
# ─── init-letsencrypt.sh ────────────────────────────────────────────────────
# Emite los certificados Let's Encrypt por primera vez.
# Ejecutar UNA sola vez por dominio, desde la raíz del proyecto en el servidor.
#
# Uso:
#   DOMAINS="tudominio.com www.tudominio.com" EMAIL="tu@email.com" \
#     bash scripts/init-letsencrypt.sh
#
# Requisitos:
#   - docker + docker compose instalados
#   - DNS apuntando al servidor (A/AAAA registros)
#   - Puerto 80 libre (para el challenge HTTP)
set -euo pipefail

: "${DOMAINS:?Debes definir DOMAINS='dom1 dom2 ...'}"
: "${EMAIL:?Debes definir EMAIL=tu@email.com}"

STAGING="${STAGING:-0}"   # 1 para pruebas (evita rate-limits de LE)

log()  { echo -e "\n\033[1;32m==>\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }

# 1. Crear dirs necesarios
log "Creando /etc/letsencrypt y /var/www/certbot ..."
sudo mkdir -p /etc/letsencrypt /var/www/certbot

# 2. Certificado dummy temporal (para que nginx arranque)
PRIMARY_DOMAIN="$(echo "$DOMAINS" | awk '{print $1}')"
DUMMY_PATH="/etc/letsencrypt/live/${PRIMARY_DOMAIN}"

if [[ ! -f "${DUMMY_PATH}/fullchain.pem" ]]; then
  log "Generando certificado dummy para ${PRIMARY_DOMAIN} ..."
  sudo mkdir -p "$DUMMY_PATH"
  sudo docker run --rm -v /etc/letsencrypt:/etc/letsencrypt \
    --entrypoint openssl certbot/certbot:latest \
    req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "${DUMMY_PATH}/privkey.pem" \
      -out    "${DUMMY_PATH}/fullchain.pem" \
      -subj "/CN=localhost"
  sudo cp "${DUMMY_PATH}/fullchain.pem" "${DUMMY_PATH}/chain.pem"
fi

# 3. Arrancar nginx con el cert dummy
log "Levantando nginx con cert dummy ..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

# 4. Eliminar cert dummy antes del real
log "Eliminando dummy cert ..."
sudo rm -rf "$DUMMY_PATH"

# 5. Solicitar cert real
STAGING_FLAG=""
[[ "$STAGING" == "1" ]] && STAGING_FLAG="--staging"

DOMAIN_ARGS=""
for d in $DOMAINS; do DOMAIN_ARGS="$DOMAIN_ARGS -d $d"; done

log "Solicitando certificado real a Let's Encrypt ..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "" certbot \
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_FLAG \
    --email "$EMAIL" \
    --agree-tos --no-eff-email \
    --force-renewal \
    $DOMAIN_ARGS

# 6. Recargar nginx con el cert real
log "Recargando nginx ..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload || \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

log "✅ Certificado emitido. Verifica con: curl -I https://${PRIMARY_DOMAIN}"
