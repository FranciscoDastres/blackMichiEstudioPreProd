// backend/services/authService.js
const pool = require("../lib/db");
const { createClient } = require("@supabase/supabase-js");
const { OAuth2Client } = require("google-auth-library");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // service_role, solo en backend
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ✅ Registro — sin cambios
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

    // Login automático para obtener el token de sesión
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw new Error(loginError.message);

    return {
        user: result.rows[0],
        token: session.session.access_token,
        refresh_token: session.session.refresh_token,
    };
}

// ✅ Login — sin cambios
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

// ✅ Google Login — sin cambios
async function googleLogin(token) {
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let authUser;
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing.users.find((u) => u.email === email);

    if (!found) {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
        });
        if (error) throw new Error(error.message);
        authUser = data.user;
    } else {
        authUser = found;
    }

    let result = await pool.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE auth_id = $1",
        [authUser.id]
    );

    if (!result.rows.length) {
        result = await pool.query(
            `INSERT INTO usuarios (auth_id, nombre, email, rol)
       VALUES ($1, $2, $3, 'cliente')
       RETURNING id, nombre, email, rol`,
            [authUser.id, name, email]
        );
    }

    const { data: session } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
    });

    return {
        user: result.rows[0],
        token: session?.properties?.access_token || null,
    };
}

// ✅ Verificar token — sin cambios
async function verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error("Token inválido");
    return data.user;
}

// ✅ NUEVO — Logout: invalida todos los tokens del usuario en Supabase
// Usar auth_id (el UUID de Supabase) para revocar la sesión
async function logout(authId) {
    const { error } = await supabase.auth.admin.signOut(authId, "global");
    if (error) throw new Error(error.message);
}

// ✅ Cambiar contraseña — verifica la actual antes de cambiar
async function changePassword(authId, email, currentPassword, newPassword) {
    // Verificar contraseña actual intentando un login
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
    });
    if (loginError) throw new Error('La contraseña actual es incorrecta');

    // Actualizar contraseña en Supabase
    const { error: updateError } = await supabase.auth.admin.updateUserById(authId, {
        password: newPassword,
    });
    if (updateError) throw new Error(updateError.message);
}

module.exports = { register, login, googleLogin, verifyToken, logout, changePassword };
