// backend/services/authService.js
const pool = require("../lib/db");
const { createClient } = require("@supabase/supabase-js");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Cliente admin (service role) — para operaciones de administración
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Cliente anon — NECESARIO para verifyOtp y operaciones de sesión de usuario
// La service role key no crea sesiones de usuario correctamente en verifyOtp
const supabaseAnon = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ✅ Registro
async function register(nombre, email, password) {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (error) throw new Error(error.message);

    const authId = data.user.id;

    const exists = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
    );
    if (exists.rows.length > 0) {
        await supabase.auth.admin.deleteUser(authId);
        throw new Error("El email ya está registrado");
    }

    const result = await pool.query(
        `INSERT INTO usuarios (auth_id, nombre, email, rol)
     VALUES ($1, $2, $3, 'cliente')
     RETURNING id, nombre, email, rol`,
        [authId, nombre, email]
    );

    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw new Error(loginError.message);

    return {
        user: result.rows[0],
        token: session.session.access_token,
        refresh_token: session.session.refresh_token,
    };
}

// ✅ Login
async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw new Error("Credenciales incorrectas");

    const result = await pool.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE auth_id = $1",
        [data.user.id]
    );
    if (!result.rows.length) throw new Error("Perfil no encontrado");

    return {
        user: result.rows[0],
        token: data.session.access_token,
        refresh_token: data.session.refresh_token,
    };
}

// ✅ Google Login
async function googleLogin(idToken) {
    // Verificar ID token con google-auth-library (el frontend usa GoogleLogin component)
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    if (!email) throw new Error("No se pudo obtener el email de Google");

    // Buscar o crear usuario en Supabase Auth
    const { data: userByEmail, error: lookupError } = await supabase.auth.admin.getUserByEmail(email);

    let authUser;
    if (lookupError || !userByEmail?.user) {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
        });
        if (error) throw new Error("Error creando usuario: " + error.message);
        authUser = data.user;
    } else {
        authUser = userByEmail.user;
    }

    // Buscar o crear perfil en la tabla local
    let result = await pool.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE auth_id = $1",
        [authUser.id]
    );

    if (!result.rows.length) {
        // También verificar por email por si el auth_id no coincide
        const byEmail = await pool.query(
            "SELECT id, nombre, email, rol FROM usuarios WHERE email = $1",
            [email]
        );
        if (byEmail.rows.length > 0) {
            // Actualizar el auth_id si el usuario existe por email pero con otro auth_id
            await pool.query(
                "UPDATE usuarios SET auth_id = $1 WHERE email = $2",
                [authUser.id, email]
            );
            result = byEmail;
        } else {
            result = await pool.query(
                `INSERT INTO usuarios (auth_id, nombre, email, rol)
                 VALUES ($1, $2, $3, 'cliente')
                 RETURNING id, nombre, email, rol`,
                [authUser.id, name || email.split("@")[0], email]
            );
        }
    }

    // Generar magic link OTP usando el cliente admin
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
    });
    if (linkError) throw new Error("Error generando sesión: " + linkError.message);

    // Verificar OTP con el cliente ANON (NO con service role)
    // La service role key no retorna sesiones de usuario en verifyOtp
    const { data: sessionData, error: otpError } = await supabaseAnon.auth.verifyOtp({
        email,
        token: linkData.properties.email_otp,
        type: "magiclink",
    });
    if (otpError) throw new Error("Error verificando sesión: " + otpError.message);
    if (!sessionData?.session) throw new Error("No se pudo crear la sesión. Intenta de nuevo.");

    return {
        user: result.rows[0],
        token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
    };
}

// ✅ Verificar token
async function verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error("Token inválido");
    return data.user;
}

// ✅ Logout
async function logout(authId) {
    const { error } = await supabase.auth.admin.signOut(authId, "global");
    if (error) throw new Error(error.message);
}

// ✅ Cambiar contraseña
async function changePassword(authId, email, currentPassword, newPassword) {
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
    });
    if (loginError) throw new Error('La contraseña actual es incorrecta');

    const { error: updateError } = await supabase.auth.admin.updateUserById(authId, {
        password: newPassword,
    });
    if (updateError) throw new Error(updateError.message);
}

module.exports = { register, login, googleLogin, verifyToken, logout, changePassword };
