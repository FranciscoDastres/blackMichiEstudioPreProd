const { query } = require('../lib/db');

const getAllUsers = async () => {
    const result = await query(
        `SELECT id, nombre, email, rol, telefono, activo, created_at 
         FROM usuarios 
         ORDER BY created_at DESC`
    );
    return result.rows;
};

module.exports = { getAllUsers };