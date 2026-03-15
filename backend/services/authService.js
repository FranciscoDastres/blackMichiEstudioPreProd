// backend/services/authService.js
const pool = require("../lib/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ✅ Generar token JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// ✅ Registro de usuario
async function register(nombre, email, password) {
    try {
        // Verificar si existe
        const exists = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",
            [email]
        );
        if (exists.rows.length > 0) {
            throw new Error("El email ya está registrado");
        }

        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol",
            [nombre, email, hashed, "cliente"]
        );

        const user = result.rows[0];
        return {
            user,
            token: generateToken(user),
        };
    } catch (error) {
        throw error;
    }
}

// ✅ Login tradicional
async function login(email, password) {
    try {
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );
        if (result.rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error("Contraseña incorrecta");
        }

        return {
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
            },
            token: generateToken(user),
        };
    } catch (error) {
        throw error;
    }
}

// ✅ Google Login
async function googleLogin(token) {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();

        // Buscar o crear usuario
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        let user;
        if (result.rows.length === 0) {
            // Crear nuevo usuario
            const newUser = await pool.query(
                "INSERT INTO usuarios (nombre, email, rol) VALUES ($1, $2, $3) RETURNING id, nombre, email, rol",
                [name, email, "cliente"]
            );
            user = newUser.rows[0];
        } else {
            user = result.rows[0];
        }

        return {
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
            },
            token: generateToken(user),
        };
    } catch (error) {
        throw error;
    }
}

// ✅ Verificar token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error("Token inválido");
    }
}

module.exports = {
    generateToken,
    register,
    login,
    googleLogin,
    verifyToken,
};
