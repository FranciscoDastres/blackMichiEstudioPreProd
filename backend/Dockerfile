# 1. Usamos una imagen con herramientas de compilación para dependencias nativas (como sharp)
FROM node:20-alpine AS builder

# Instalamos dependencias necesarias para compilar módulos nativos de Node
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Usamos npm ci para instalaciones exactas y limpias
RUN npm ci --omit=dev

# 2. Etapa final: imagen más ligera para ejecución
FROM node:20-alpine

WORKDIR /app

# Instalamos librerías de sistema que 'sharp' necesita para correr en Alpine
RUN apk add --no-cache vips-dev

# Copiamos solo lo necesario desde la etapa de compilación
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Render usa dinámicamente el puerto, pero es buena práctica exponer 10000
EXPOSE 10000

# Script de inicio asegurando que usemos la variable de entorno PORT
CMD ["node", "index.js"]