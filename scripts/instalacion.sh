#!/usr/bin/env bash
set -euo pipefail

# -------- helpers ----------
log() { echo -e "\n\033[1;32m==>\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
die() { echo -e "\033[1;31m[ERROR]\033[0m $*" >&2; exit 1; }

# El script ahora vive en /scripts, la raíz del proyecto es un nivel arriba
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
INIT_DB="${SCRIPT_DIR}/init_db.sh"

# -------- sanity checks ----------
[[ -d "$BACKEND_DIR" ]] || die "No existe $BACKEND_DIR"
[[ -d "$FRONTEND_DIR" ]] || die "No existe $FRONTEND_DIR"
[[ -f "$INIT_DB" ]] || die "No existe $INIT_DB (init_db.sh)"

# Ask for sudo once (so it won't ask mid-way)
log "Validando sudo..."
sudo -v

# -------- Backend ----------
log "Backend: instalando dependencias..."
cd "$BACKEND_DIR"
npm i
npm i express cors

log "Backend: levantando servidor (background) con logs..."
# Stop previous run if pid exists
PID_FILE="${ROOT_DIR}/.backend.pid"
LOG_FILE="${ROOT_DIR}/backend.log"

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [[ -n "${OLD_PID:-}" ]] && ps -p "$OLD_PID" >/dev/null 2>&1; then
    warn "Backend anterior detectado (PID=$OLD_PID). Deteniéndolo..."
    kill "$OLD_PID" || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

nohup node index.js > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
log "Backend corriendo (PID=$(cat "$PID_FILE")). Log: $LOG_FILE"

# -------- Frontend / Node via nvm ----------
log "Frontend: instalando nvm (si falta) y Node 20..."
# Install nvm if not present
if [[ ! -d "${HOME}/.nvm" ]]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
else
  warn "nvm ya existe en ${HOME}/.nvm (no se reinstala)."
fi

# Load nvm for non-interactive shells
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1090
[[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh" || die "No pude cargar nvm.sh en $NVM_DIR"

nvm install 20
nvm use 20
nvm alias default 20

log "Node actual: $(node -v) | npm: $(npm -v)"

log "Frontend: instalando dependencias..."
cd "$FRONTEND_DIR"
npm i

# -------- PostgreSQL ----------
log "BBDD: instalando PostgreSQL 18 (repo PGDG)..."
sudo apt-get update -y
sudo apt-get install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
sudo apt-get install -y postgresql-18

log "BBDD: ejecutando init_db.sh..."
chmod +x "$INIT_DB"
"$INIT_DB"

# -------- Summary ----------
log "LISTO ✅"
echo "Proyecto root: $ROOT_DIR"
echo "Backend PID file: $PID_FILE"
echo "Backend log:      $LOG_FILE"
echo ""
echo "Comandos útiles:"
echo "  Ver log backend: tail -n 200 -f \"$LOG_FILE\""
echo "  Parar backend:   kill \$(cat \"$PID_FILE\")"
echo "  Levantar frontend (manual): cd \"$FRONTEND_DIR\" && npm run dev"

