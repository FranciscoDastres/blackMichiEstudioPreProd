import db from "../lib/db.js";
import { createClient } from "@supabase/supabase-js";
import { OAuth2Client } from "google-auth-library";
import logger from "../lib/logger.js";
import * as emailService from "./emailService.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) throw new Error("Falta GOOGLE_CLIENT_ID en variables de entorno");

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const supabaseAnon = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

//
// 🔐 REGISTER
//
export async function register(nombre, email, password) {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (error) throw new Error(error.message);

    const authId = data.user.id;

    const exists = await db.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
    );

    if (exists.rows.length > 0) {
        await supabase.auth.admin.deleteUser(authId);
        throw new Error("El email ya está registrado");
    }

    const result = await db.query(
        `INSERT INTO usuarios (auth_id, nombre, email, rol)
         VALUES ($1, $2, $3, 'cliente')
         RETURNING id, nombre, email, rol`,
        [authId, nombre, email]
    );

    const { data: session, error: loginError } =
        await supabase.auth.signInWithPassword({ email, password });

    if (loginError) throw new Error(loginError.message);

    // 🔸 Email (no rompe si falla)
    try {
        await emailService.emailBienvenida(nombre, email);
    } catch (err) {
        logger.warn("Error enviando email de bienvenida");
    }

    return {
        user: result.rows[0],
        token: session.session.access_token,
        refresh_token: session.session.refresh_token,
    };
}

//
// 🔐 LOGIN
//
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new Error("Credenciales incorrectas");

    const result = await db.query(
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

//
// 🔐 GOOGLE LOGIN
//
export async function googleLogin(idToken) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();
    if (!email) throw new Error("No se pudo obtener el email de Google");

    // Buscar auth_id en nuestra propia DB primero (más confiable que listUsers filter)
    let authUser;
    const dbCheck = await db.query(
        "SELECT auth_id FROM usuarios WHERE email = $1",
        [email]
    );

    if (dbCheck.rows[0]?.auth_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(dbCheck.rows[0].auth_id);
        authUser = userData?.user || null;
    }

    if (!authUser) {
        // No está en nuestra DB — intentar crear en Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
        });

        if (error) {
            if (error.message.includes('already been registered')) {
                // Existe en Supabase Auth pero no en nuestra DB — buscar con listUsers
                const { data: listData } = await supabase.auth.admin.listUsers({
                    perPage: 1,
                    page: 1,
                    filter: `email=${email}`,
                });
                authUser = listData?.users?.find(u => u.email === email);
                if (!authUser) throw new Error("No se pudo recuperar el usuario existente");
            } else {
                throw new Error("Error creando usuario: " + error.message);
            }
        } else {
            authUser = data.user;
        }
    }

    let result = await db.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE auth_id = $1",
        [authUser.id]
    );

    if (!result.rows.length) {
        const byEmail = await db.query(
            "SELECT id, nombre, email, rol FROM usuarios WHERE email = $1",
            [email]
        );

        if (byEmail.rows.length > 0) {
            await db.query(
                "UPDATE usuarios SET auth_id = $1 WHERE email = $2",
                [authUser.id, email]
            );
            result = byEmail;
        } else {
            const displayName = name || email.split("@")[0];

            result = await db.query(
                `INSERT INTO usuarios (auth_id, nombre, email, rol)
                 VALUES ($1, $2, $3, 'cliente')
                 RETURNING id, nombre, email, rol`,
                [authUser.id, displayName, email]
            );

            try {
                await emailService.emailBienvenida(displayName, email);
            } catch (err) {
                logger.warn("Error enviando email bienvenida Google");
            }
        }
    }

    const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
            type: "magiclink",
            email,
        });

    if (linkError) throw new Error("Error generando sesión: " + linkError.message);

    const { data: sessionData, error: otpError } =
        await supabaseAnon.auth.verifyOtp({
            email,
            token: linkData.properties.email_otp,
            type: "magiclink",
        });

    if (otpError) throw new Error("Error verificando sesión: " + otpError.message);
    if (!sessionData?.session)
        throw new Error("No se pudo crear la sesión. Intenta de nuevo.");

    return {
        user: result.rows[0],
        token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
    };
}

//
// 🔐 VERIFY TOKEN
//
export async function verifyToken(token) {
    if (!token) throw new Error("Token requerido");

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) throw new Error("Token inválido");

    return data.user;
}

//
// 🚫 LOGOUT (ELIMINADO BACKEND)
//
export async function logout() {
    // 🔥 IMPORTANTE:
    // Supabase maneja logout en el FRONTEND
    // Aquí no hacemos nada para evitar errores
    return true;
}

//
// 🔐 CHANGE PASSWORD
//
export async function changePassword(authId, email, currentPassword, newPassword) {
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
    });

    if (loginError) throw new Error("La contraseña actual es incorrecta");

    const { error: updateError } =
        await supabase.auth.admin.updateUserById(authId, {
            password: newPassword,
        });

    if (updateError) throw new Error(updateError.message);
}

//
// 🔐 FORGOT PASSWORD
//
export async function forgotPassword(email) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${frontendUrl}/reset-password`,
    });

    if (error) {
        logger.warn(
            { err: error },
            "forgotPassword error (puede que el email no exista)"
        );
    }
}

//
// 🔐 RESET PASSWORD
//
export async function resetPassword(token, newPassword) {
    if (!newPassword || newPassword.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user)
        throw new Error("El enlace es inválido o ya expiró");

    const { error: updateError } =
        await supabase.auth.admin.updateUserById(data.user.id, {
            password: newPassword,
        });

    if (updateError) throw new Error(updateError.message);
}