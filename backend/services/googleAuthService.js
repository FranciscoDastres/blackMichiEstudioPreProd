// services/googleAuthService.js
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
        email: payload.email,
        nombre: payload.name,
        imagen: payload.picture,
    };
}

module.exports = { verifyGoogleToken };
