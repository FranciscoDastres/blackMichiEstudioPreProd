const pool = require("../lib/db");

const createTables = async () => {
  try {
    console.log('🗑️  Eliminando tablas existentes...');

    // Eliminar tablas en orden (respetando foreign keys)
    await pool.query('DROP TABLE IF EXISTS productos CASCADE');
    await pool.query('DROP TABLE IF EXISTS usuarios CASCADE');
    await pool.query('DROP TABLE IF EXISTS categorias CASCADE');

    console.log('✅ Tablas eliminadas');
    console.log('📝 Creando tablas nuevas...');

    // Crear tabla de categorías
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'cliente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        precio_anterior DECIMAL(10,2),
        descripcion TEXT,
        descuento DECIMAL(5,2),
        imagen_principal TEXT,
        imagenes_adicionales TEXT[],
        categoria_id INTEGER REFERENCES categorias(id),
        stock INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        usuario_id INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tablas creadas');
    console.log('📥 Insertando categorías...');

    // Insertar categorías
    await pool.query(`
      INSERT INTO categorias (nombre, descripcion) 
      VALUES 
        ('armas-de-fantasia', 'Armas de fantasía y ciencia ficción'),
        ('futurama', 'Productos inspirados en Futurama'),
        ('navi', 'Productos de la película Avatar'),
        ('robots', 'Robots y figuras robóticas'),
        ('vasos3d', 'Vasos y tazas 3D personalizadas')
    `);

    console.log('✅ Categorías insertadas');
    console.log('📥 Insertando usuario admin...');

    // Insertar usuario admin
    const bcrypt = require('bcrypt');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol) 
      VALUES ('Admin Demo', 'admin@demo.com', $1, 'admin')
    `, [adminPassword]);

    console.log('✅ Usuario admin insertado');
    console.log('📥 Insertando productos...');

    // Insertar productos con precios en CLP
    await pool.query(`
  INSERT INTO productos (titulo, precio, precio_anterior, descripcion, descuento, categoria_id, stock, activo, usuario_id, imagen_principal, imagenes_adicionales) 
  VALUES 
    ('Espada de Fantasía', 34990, 39990, 'Espada decorativa de fantasía impresa en 3D', 12.5, 1, 15, true, 1, '/images/products/armas-de-fantasia/Unknow_2 weapon.webp', ARRAY['/images/products/armas-de-fantasia/Unknow_2 weapon.webp']),
    ('Bender Chulo', 24990, 29990, 'Figura de Bender de Futurama impresa en 3D', 16.7, 2, 12, true, 1, '/images/products/futurama/bender-chulo.webp', ARRAY['/images/products/futurama/bender-chulo.webp']),
    ('Placa Navi - Horda', 39990, 45990, 'Placa decorativa estilo Navi - World of Warcraft', 13, 3, 8, true, 1, '/images/products/navi/honda.webp', ARRAY['/images/products/navi/honda.webp', '/images/products/navi/placa-navi.webp', '/images/products/navi/placa-navi2.webp']),
    ('Placa Navi - Alianza', 39990, 45990, 'Placa decorativa estilo Navi - World of Warcraft Alianza', 13, 3, 8, true, 1, '/images/products/navi/placa-navi3.webp', ARRAY['/images/products/navi/placa-navi3.webp', '/images/products/navi/placa-navi4.webp', '/images/products/navi/placa-navi5.webp']),
    ('Robot Futurista', 49990, 59990, 'Robot decorativo futurista impreso en 3D', 16.7, 4, 10, true, 1, '/images/products/robots/Unknow_1.webp', ARRAY['/images/products/robots/Unknow_1.webp', '/images/products/robots/Unknow_2.webp']),
    ('Vaso 3D Personalizado - Rojo', 17990, 19990, 'Vaso de color personalizado impreso en 3D', 10, 5, 25, true, 1, '/images/products/vasos3d/colour-glass1.webp', ARRAY['/images/products/vasos3d/colour-glass1.webp']),
    ('Vaso 3D Personalizado - Verde', 17990, 19990, 'Vaso de color personalizado impreso en 3D', 10, 5, 25, true, 1, '/images/products/vasos3d/green-glass1.webp', ARRAY['/images/products/vasos3d/green-glass1.webp']),
    ('Vaso 3D Personalizado - Amarillo', 17990, 19990, 'Vaso de color personalizado impreso en 3D', 10, 5, 22, true, 1, '/images/products/vasos3d/yellow-glass-1.webp', ARRAY['/images/products/vasos3d/yellow-glass-1.webp', '/images/products/vasos3d/yellow-glass-2.webp']),
    ('Vaso 3D Personalizado - Azul', 17990, 19990, 'Vaso de color personalizado impreso en 3D', 10, 5, 20, true, 1, '/images/products/vasos3d/blue-glass.webp', ARRAY['/images/products/vasos3d/blue-glass.webp']),
    ('Vaso 3D Personalizado - Rojo Premium', 22990, 25990, 'Vaso premium de color personalizado impreso en 3D', 11.6, 5, 15, true, 1, '/images/products/vasos3d/yellow-red-glass.webp', ARRAY['/images/products/vasos3d/yellow-red-glass.webp'])
`);


    console.log('✅ Productos insertados');
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   - 5 categorías');
    console.log('   - 1 usuario admin (admin@demo.com / admin123)');
    console.log('   - 10 productos de ejemplo');
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  }
};

// Ejecutar migración si se llama directamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('\n✔️  Puedes cerrar esta consola');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error fatal en migración:', error);
      process.exit(1);
    });
}

module.exports = createTables;
