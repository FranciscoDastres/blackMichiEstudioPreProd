#!/usr/bin/env bash
set -euo pipefail

# ==============================
# CONFIG BÁSICA
# ==============================
# Leer desde env vars; NO hay fallback inseguro para DB_PASS.
DB_NAME="${DB_NAME:-blackmichiestudio}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-}"

if [[ -z "$DB_PASS" ]]; then
  echo "❌ DB_PASS requerido. Ejemplo: DB_PASS='mi-pass-fuerte' bash scripts/init_db.sh" >&2
  exit 1
fi

# ==============================
# RUTAS (script vive en /scripts, proyecto un nivel arriba)
# ==============================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SCHEMA_DIR="${PROJECT_DIR}/backend/db"

# Orden importa: los archivos 01-06 se aplican secuencialmente
SCHEMA_FILES=(
  "${SCHEMA_DIR}/01_usuarios.sql"
  "${SCHEMA_DIR}/02_catalogo.sql"
  "${SCHEMA_DIR}/03_pedidos.sql"
  "${SCHEMA_DIR}/04_reviews.sql"
  "${SCHEMA_DIR}/05_extras.sql"
  "${SCHEMA_DIR}/06_triggers.sql"
)

for f in "${SCHEMA_FILES[@]}"; do
  [[ -f "$f" ]] || { echo "❌ No existe: $f" >&2; exit 1; }
done

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
# APLICAR SCHEMA (01-06 en orden)
# ==============================
for f in "${SCHEMA_FILES[@]}"; do
  echo "==> Aplicando $(basename "$f")..."
  sudo -u postgres psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 -f "$f"
done

echo "✅ Listo: DB='${DB_NAME}', user='${DB_USER}', schema base aplicado."
echo "ℹ️  Para migrations incrementales, ejecuta los SQL en backend/db/migrations/ en orden."
