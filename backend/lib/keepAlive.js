import http from "http";
import https from "https";
import logger from "./logger.js";

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://blackmichiestudiopreprod.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000;

logger.info({ url: RENDER_URL, intervalMin: PING_INTERVAL / 60000 }, "Keep-Alive configurado");

const ping = () => {
    const protocol = RENDER_URL.startsWith('https') ? https : http;

    protocol
        .get(`${RENDER_URL}/health`, (res) => {
            if (res.statusCode === 200) {
                logger.debug("Keep-Alive: Servidor activo");
            }
        })
        .on('error', (err) => {
            logger.warn({ err }, "Keep-Alive error");
        })
        .setTimeout(5000);
};

let pingInterval;

function start() {
    ping();
    pingInterval = setInterval(() => {
        ping();
    }, PING_INTERVAL);
    logger.info("Keep-Alive iniciado");
}

function stop() {
    if (pingInterval) {
        clearInterval(pingInterval);
        logger.info("Keep-Alive detenido");
    }
}

export { start, stop };
export default { start, stop };
