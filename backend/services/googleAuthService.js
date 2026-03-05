// services/googleAuthService.js
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    try {
        // ✅ Validar que el token existe
        if (!idToken) {
            throw new Error('Token no proporcionado');
        }

        // ✅ Validar que Google Client ID existe
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('❌ GOOGLE_CLIENT_ID no configurado');
            throw new Error('Google Auth no configurado en servidor');
        }

        // ✅ Verificar token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // ✅ Validar que getPayload devuelve datos
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Token inválido o expirado');
        }

        return {
            email: payload.email,
            nombre: payload.name,
            imagen: payload.picture,
        };

    } catch (error) {
        console.error('❌ Error verificando Google Token:', error.message);
        throw new Error(`Google Auth Error: ${error.message}`);
    }
}

module.exports = { verifyGoogleToken };
