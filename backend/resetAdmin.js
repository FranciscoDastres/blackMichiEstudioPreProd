const bcrypt = require('bcrypt');
const db = require('./lib/db');

async function resetPassword() {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.query(
        'UPDATE usuarios SET password = $1 WHERE rol = $2 RETURNING id, email, nombre',
        [hashedPassword, 'admin']
    );

    console.log('✅ Admin actualizado:', result.rows[0]);
    console.log('🔑 Nueva contraseña:', newPassword);
    process.exit(0);
}

resetPassword();
