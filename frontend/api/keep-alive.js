// api/keep-alive.js
// Vercel Serverless Function — pinga el backend en Render cada 14 min
// para evitar que entre en modo sleep (free tier se duerme a los 15 min)

const https = require('https');
const http = require('http');

const RENDER_URL =
  process.env.VITE_API_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  'https://blackmichiestudiopreprod.onrender.com';

module.exports = (req, res) => {
  const healthUrl = `${RENDER_URL}/health`;
  const protocol = healthUrl.startsWith('https') ? https : http;

  const request = protocol.get(healthUrl, (pingRes) => {
    let body = '';
    pingRes.on('data', (chunk) => (body += chunk));
    pingRes.on('end', () => {
      console.log(`[keep-alive] ${new Date().toISOString()} — status ${pingRes.statusCode}`);
      res.status(200).json({
        ok: true,
        pinged: healthUrl,
        status: pingRes.statusCode,
        ts: new Date().toISOString(),
      });
    });
  });

  request.on('error', (err) => {
    console.error(`[keep-alive] Error: ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  });

  request.setTimeout(10000, () => {
    request.destroy();
    res.status(504).json({ ok: false, error: 'timeout' });
  });
};
