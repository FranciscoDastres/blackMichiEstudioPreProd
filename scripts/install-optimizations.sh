#!/bin/bash
set -e

# 🚀 INSTALACIÓN DE OPTIMIZACIONES - Black Michi Estudio

# Posicionarse en la raíz del proyecto (un nivel arriba de /scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/.."

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🚀 INSTALANDO OPTIMIZACIONES DE RENDIMIENTO 🚀        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
echo "✅ Backend actualizado"
cd ..
echo ""

# Frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
echo "✅ Frontend actualizado"
cd ..
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✨ LISTO PARA USAR ✨                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "🚀 Para build de producción:"
echo "  1. Backend:  npm start"
echo "  2. Frontend: npm run build"
echo ""
echo "📖 Ver OPTIMIZACIONES.md para más detalles"
echo ""
