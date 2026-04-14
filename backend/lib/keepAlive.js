import http from "http";
import https from "https";

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://blackmichiestudiopreprod.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000;

console.log(`⏰ Keep-Alive configurado para ${RENDER_URL}`);
console.log(`📍 Ping cada ${PING_INTERVAL / 60000} minutos`);

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
        .setTimeout(5000);
};

let pingInterval;

function start() {
    ping();
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

export { start, stop };
export default { start, stop };
