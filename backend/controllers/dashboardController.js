// Importamos la función query que definiste en tu lib/db
const { query } = require('../lib/db');

exports.obtenerEstadisticas = async (req, res) => {
    try {
        // En Postgres usamos consultas SQL reales, no funciones de Mongoose
        const [totalUsuarios, ultimosCinco] = await Promise.all([
            query('SELECT COUNT(*) FROM usuarios'),
            query('SELECT id, nombre, email, creado_en FROM usuarios ORDER BY creado_en DESC LIMIT 5')
        ]);

        res.status(200).json({
            ok: true,
            msg: 'Estadísticas cargadas desde PostgreSQL',
            data: {
                contador: {
                    usuarios: parseInt(totalUsuarios.rows[0].count),
                    online: Math.floor(Math.random() * 10) // Simulación
                },
                recientes: ultimosCinco.rows,
                graficaData: [12, 19, 3, 5, 2, 3, 15] // Datos para tu frontend
            }
        });

    } catch (error) {
        console.error('❌ Error en el Dashboard:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al consultar la base de datos Postgres'
        });
    }
};