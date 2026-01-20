#!/usr/bin/env bash
set -euo pipefail

# ==============================
# CONFIG BÁSICA
# ==============================
DB_NAME="${DB_NAME:-blackmichiestudio}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-hola123}"

# Ruta absoluta al proyecto y al schema
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCHEMA_FILE="$PROJECT_DIR/backend/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "ERROR: No existe el archivo schema: $SCHEMA_FILE" >&2
  exit 1
fi

# ==============================
# CREAR / ACTUALIZAR ROL
# ==============================
echo "==> Creando/actualizando rol '$DB_USER'..."

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}' CREATEDB CREATEROLE;
  ELSE
    ALTER ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL

# ==============================
# CREAR DB SI NO EXISTE
# ==============================
echo "==> Verificando si existe DB '$DB_NAME'..."

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" || true | tr -d '[:space:]')

if [ "$DB_EXISTS" != "1" ]; then
  echo "==> Creando DB '$DB_NAME'..."
  sudo -u postgres createdb -O "${DB_USER}" -T template0 -E UTF8 "${DB_NAME}"
else
  echo "==> DB '$DB_NAME' ya existe (no se crea)."
fi

# ==============================
# PRIVILEGIOS SOBRE LA DB
# ==============================
echo "==> Asegurando owner/privilegios..."

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

# ==============================
# APLICAR SCHEMA
# ==============================
echo "==> Ejecutando schema '${SCHEMA_FILE}' en DB '${DB_NAME}'..."

sudo -u postgres psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "${SCHEMA_FILE}"

echo "✅ Listo: DB='${DB_NAME}', user='${DB_USER}' y schema aplicado."
