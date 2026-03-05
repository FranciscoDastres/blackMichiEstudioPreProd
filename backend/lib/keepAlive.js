// lib/keepAlive.js
/**
 * Keep-Alive para Render
 * Hace un ping al servidor cada 14 minutos para mantenerlo despierto
 * (Render duerme después de 15 minutos de inactividad en free tier)
 */

const http = require('http');
const https = require('https');

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://blackmichiestudiopreprod.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutos en milisegundos

console.log(`⏰ Keep-Alive configurado para ${RENDER_URL}`);
console.log(`📍 Ping cada ${PING_INTERVAL / 60000} minutos`);

// Función para hacer ping
const ping = () => {
  const protocol = RENDER_URL.startsWith('https') ? https : http;
  
  protocol
    .get(`${RENDER_URL}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ [${new Date().toISOString()}] Keep-Alive: Servidor activo`);
      }
    })
    .on('error', (err) => {
      console.warn(`⚠️ Keep-Alive error: ${err.message}`);
    })
    .setTimeout(5000); // Timeout de 5 segundos
};

// Iniciar ping automático
let pingInterval;

function start() {
  // Primer ping inmediato
  ping();
  
  // Luego cada 14 minutos
  pingInterval = setInterval(() => {
    ping();
  }, PING_INTERVAL);
  
  console.log('🔄 Keep-Alive iniciado');
}

function stop() {
  if (pingInterval) {
    clearInterval(pingInterval);
    console.log('⏹️ Keep-Alive detenido');
  }
}

module.exports = { start, stop };
