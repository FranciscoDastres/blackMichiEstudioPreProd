const pool = require("../lib/db");
const { createClient } = require("@supabase/supabase-js");
const { OAuth2Client } = require("google-auth-library");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // service_role, solo en backend
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ✅ Registro
async function register(nombre, email, password) {
    // 1. Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (error) throw new Error(error.message);

    const authId = data.user.id;

    // 2. Verificar que no exista el email en tu tabla
    const exists = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1", [email]
    );
    if (exists.rows.length > 0) {
        await supabase.auth.admin.deleteUser(authId); // rollback
        throw new Error("El email ya está registrado");
    }

    // 3. Crear perfil en tu tabla usuarios
    const result = await pool.query(
        `INSERT INTO usuarios (auth_id, nombre, email, rol)
     VALUES ($1, $2, $3, 'cliente')
     RETURNING id, nombre, email, rol`,
        [authId, nombre, email]
    );

    return { user: result.rows[0] };
}

// ✅ Login
async function login(email, password) {
    // Supabase verifica la contraseña y devuelve sesión
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw new Error("Credenciales incorrectas");

    // Traer perfil desde tu tabla
    const result = await pool.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE auth_id = $1",
        [data.user.id]
    );
    if (!result.rows.length) throw new Error("Perfil no encontrado");

    return {
        user: result.rows[0],
        token: data.session.access_token, // JWT de Supabase
        refresh_token: data.session.refresh_token,
    };
}

// ✅ Google Login
async function googleLogin(token) {
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    // Buscar o crear en Supabase Auth
    let authUser;
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing.users.find(u => u.email === email);

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

    // Buscar o crear perfil
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

    // Generar sesión
    const { data: session } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
    });

    return {
        user: result.rows[0],
        token: session?.properties?.access_token || null,
    };
}

// ✅ Verificar token (reemplaza jwt.verify)
async function verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new Error("Token inválido");
    return data.user;
}

module.exports = { register, login, googleLogin, verifyToken };