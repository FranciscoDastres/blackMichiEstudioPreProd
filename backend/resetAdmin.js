const { createClient } = require("@supabase/supabase-js");
const db = require('./lib/db');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function resetAdmin() {
    const email = process.env.ADMIN_RESET_EMAIL || 'admin@blackmichiestudio.com';
    const newPassword = process.env.ADMIN_RESET_PASSWORD;

    if (!newPassword || newPassword.length < 12) {
        console.error('❌ ADMIN_RESET_PASSWORD requerido (mínimo 12 caracteres)');
        console.error('   Uso: ADMIN_RESET_PASSWORD="<pass-seguro>" node resetAdmin.js');
        process.exit(1);
    }

    // Buscar el admin en tu tabla
    const result = await db.query(
        'SELECT auth_id FROM usuarios WHERE rol = $1',
        ['admin']
    );

    if (!result.rows.length) {
        console.error('❌ No se encontró usuario admin');
        process.exit(1);
    }

    const authId = result.rows[0].auth_id;

    // Actualizar contraseña en Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(authId, {
        password: newPassword
    });

    if (error) {
        console.error('❌ Error actualizando contraseña:', error.message);
        process.exit(1);
    }

    console.log('✅ Admin actualizado:', email);
    console.log('🔑 Contraseña actualizada desde ADMIN_RESET_PASSWORD');
    process.exit(0);
}

resetAdmin();