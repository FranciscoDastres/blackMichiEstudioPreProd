# ─── Builder: dependencias nativas (sharp, etc.) ─────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

# Instalación exacta y limpia, sólo prod
RUN npm ci --omit=dev

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine

# vips-dev es requerido por sharp en Alpine
RUN apk add --no-cache vips-dev wget tini \
 && addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# uploads como volumen propio del usuario de la app
RUN mkdir -p /app/uploads && chown -R app:app /app

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

# tini como PID 1: manejo correcto de señales (SIGTERM)
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
