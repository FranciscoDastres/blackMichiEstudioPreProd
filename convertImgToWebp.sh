#!/usr/bin/env bash
set -e

IMG_DIR="backend/uploads"
QUALITY=80
REMOVE_ORIGINALS=false

# Procesar flags
while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--remove)
      REMOVE_ORIGINALS=true
      shift
      ;;
    *)
      echo "Uso: $0 [-r|--remove]"
      exit 1
      ;;
  esac
done

# Verificar carpeta
if [ ! -d "$IMG_DIR" ]; then
  echo "❌ Carpeta no encontrada: $IMG_DIR"
  exit 1
fi

# Verificar cwebp
if ! command -v cwebp >/dev/null 2>&1; then
  echo "❌ cwebp no está instalado. Instálalo con:"
  echo "   sudo apt install webp"
  exit 1
fi

echo "🔍 Buscando imágenes en: $IMG_DIR"
echo "🎯 Calidad WebP: $QUALITY"
echo ""

find "$IMG_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 |
while IFS= read -r -d '' file; do
  output="${file%.*}.webp"

  if [ -f "$output" ]; then
    echo "⏭️  Ya existe, se omite: $output"
    continue
  fi

  cwebp "$file" -q "$QUALITY" -o "$output" >/dev/null
  echo "✅ Convertido: $file → $output"

  if [ "$REMOVE_ORIGINALS" = true ]; then
    rm "$file"
    echo "🗑️  Eliminado original: $file"
  fi
done

echo ""
echo "🎉 Conversión finalizada"