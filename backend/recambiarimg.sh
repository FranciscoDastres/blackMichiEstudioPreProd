#!/bin/bash
set -e

# Instalar sharp globalmente si no lo tienes
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js no está instalado"
  exit 1
fi

IMG_DIR="uploads/products"
QUALITY=80
count=0

if [ ! -d "$IMG_DIR" ]; then
  echo "❌ Carpeta no encontrada: $IMG_DIR"
  exit 1
fi

echo "🔍 Reprocesando imágenes WebP en: $IMG_DIR"
echo "🎯 Calidad WebP: $QUALITY"
echo ""

# Buscar archivos .webp recursivamente
find "$IMG_DIR" -type f -iname "*.webp" -print0 |
while IFS= read -r -d '' file; do
  echo "🔄 Procesando: $file"
  
  # Crear backup temporal
  cp "$file" "${file}.bak"
  
  # Reprocesar con Sharp (rotar + reconvertir)
  node -e "
    const sharp = require('sharp');
    sharp('${file}.bak')
      .rotate() // Auto-rotar según EXIF
      .webp({ quality: $QUALITY })
      .toFile('${file}')
      .then(() => {
        console.log('✅ Corregido: ${file}');
      })
      .catch(err => {
        console.error('❌ Error:', err.message);
        // Restaurar backup si falla
        require('fs').copyFileSync('${file}.bak', '${file}');
      })
      .finally(() => {
        // Eliminar backup
        require('fs').unlinkSync('${file}.bak');
      });
  "
  
  ((count++))
done

echo ""
echo "📊 Total reprocesadas: $count"
echo "🎉 Reprocesamiento finalizado"