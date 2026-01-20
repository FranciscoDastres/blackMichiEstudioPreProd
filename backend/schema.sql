-- =========================
-- MIGRACION Y LIMPIEZA
-- =========================

-- 1. Eliminar la tabla orders duplicada y sus índices
DROP TABLE IF EXISTS orders CASCADE;
DROP INDEX IF EXISTS idx_orders_commerce_order;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_email;
DROP INDEX IF EXISTS idx_orders_created_at;

-- =========================
-- USUARIOS (SIN CAMBIOS)
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
  telefono VARCHAR(20),
  direccion TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_ip VARCHAR(45),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CATEGORIAS (SIN CAMBIOS)
-- =========================
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(10),
  color_fondo VARCHAR(20),
  color_icono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCTOS (SIN CAMBIOS)
-- =========================
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  precio DECIMAL(10,2) NOT NULL,
  precio_anterior DECIMAL(10,2),
  descripcion TEXT,
  descuento_porcentaje DECIMAL(5,2),
  imagen_principal VARCHAR(500) NOT NULL,
  imagenes_adicionales TEXT[],
  categoria_id INTEGER REFERENCES categorias(id),
  moneda VARCHAR(10) DEFAULT 'CLP',
  destacado BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 5,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PEDIDOS (MEJORADA CON CAMPOS DE FLOW)
-- =========================
DROP TABLE IF EXISTS pedidos CASCADE;

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  
  -- Usuario (puede ser NULL para compras sin registro)
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  
  -- Datos del comprador (obligatorios incluso sin usuario registrado)
  comprador_nombre VARCHAR(255) NOT NULL,
  comprador_email VARCHAR(255) NOT NULL,
  comprador_telefono VARCHAR(20),
  
  -- Dirección de envío
  direccion_envio TEXT NOT NULL,
  
  -- Datos del pedido
  total DECIMAL(10,2) NOT NULL,
  costo_envio DECIMAL(10,2) DEFAULT 3500,
  notas TEXT,
  
  -- Estados del pedido
  estado VARCHAR(30) DEFAULT 'pendiente' CHECK (
    estado IN (
      'pendiente',      -- Creado, esperando pago
      'pagado',         -- Pago confirmado
      'confirmado',     -- Pedido confirmado por admin
      'en_proceso',     -- En preparación
      'enviado',        -- Enviado al cliente
      'entregado',      -- Entregado
      'cancelado',      -- Cancelado
      'rechazado'       -- Pago rechazado
    )
  ),
  
  -- Flow payment integration
  commerce_order VARCHAR(255) UNIQUE NOT NULL,  -- ID único que enviamos a Flow
  flow_order VARCHAR(255),                       -- ID que Flow nos devuelve
  flow_token VARCHAR(255),                       -- Token de la transacción
  flow_status INTEGER,                           -- Status code de Flow (1,2,3,4)
  flow_payment_data JSONB,                       -- Datos completos del pago
  
  -- Método de pago
  metodo_pago VARCHAR(50) DEFAULT 'flow',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_pago TIMESTAMP,
  fecha_envio TIMESTAMP,
  fecha_entrega TIMESTAMP
);

-- Índices para pedidos
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_commerce_order ON pedidos(commerce_order);
CREATE INDEX idx_pedidos_flow_order ON pedidos(flow_order);
CREATE INDEX idx_pedidos_email ON pedidos(comprador_email);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at DESC);

-- =========================
-- ITEMS DE PEDIDO (MEJORADA)
-- =========================
DROP TABLE IF EXISTS pedido_items CASCADE;

CREATE TABLE pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
  
  -- Guardamos los datos del producto en el momento de la compra
  producto_titulo VARCHAR(200) NOT NULL,
  producto_imagen VARCHAR(500),
  
  -- Cantidad y precios
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_producto_id ON pedido_items(producto_id);

-- =========================
-- TABLA DE WEBHOOKS FLOW (NUEVA)
-- =========================
CREATE TABLE IF NOT EXISTS flow_webhooks (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  
  -- Datos del webhook
  token VARCHAR(255) NOT NULL,
  flow_order VARCHAR(255),
  flow_status INTEGER,
  
  -- Request completo
  request_body JSONB NOT NULL,
  request_headers JSONB,
  
  -- Respuesta y procesamiento
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  
  -- IP de origen (para seguridad)
  ip_origen VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flow_webhooks_token ON flow_webhooks(token);
CREATE INDEX idx_flow_webhooks_pedido_id ON flow_webhooks(pedido_id);
CREATE INDEX idx_flow_webhooks_processed ON flow_webhooks(processed);

-- =========================
-- TRIGGERS
-- =========================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- SEED BÁSICO
-- =========================

-- Usuarios de ejemplo
INSERT INTO usuarios (nombre, email, password, rol)
VALUES
  ('Admin Principal', 'admin@blackmichiestudio.com', '$2b$10$rQZ8K9mN2pL5vX7wY3hJ6t', 'admin'),
  ('Cliente Ejemplo', 'cliente@ejemplo.com', '$2b$10$rQZ8K9mN2pL5vX7wY3hJ6t', 'cliente')
ON CONFLICT (email) DO NOTHING;

-- Categorías iniciales
INSERT INTO categorias (nombre, descripcion, icono, color_fondo, color_icono) VALUES
  ('vasos3d', 'Vasos personalizados en 3D', '🥤', 'bg-[#e0f2fe]', 'text-blue-500'),
  ('navi', 'Placas decorativas Navi', '🏠', 'bg-[#f1f5f9]', 'text-sky-600'),
  ('figuras', 'Figuras coleccionables 3D', '🎭', 'bg-[#cbd5e1]', 'text-gray-700')
ON CONFLICT (nombre) DO NOTHING;

-- Productos de ejemplo
INSERT INTO productos (
  titulo, slug, precio, precio_anterior, descripcion,
  descuento_porcentaje, imagen_principal, categoria_id,
  moneda, destacado, stock
) VALUES
  (
    'Vaso 3D Verde',
    'vaso-3d-verde',
    3990, 4990,
    'Vaso 3D personalizado en color verde',
    20.0,
    '/images/products/vasos3d/green-glass.webp',
    (SELECT id FROM categorias WHERE nombre = 'vasos3d'),
    'CLP', true, 50
  ),
  (
    'Placa Navi Honda',
    'placa-navi-honda',
    15990, 18990,
    'Placa decorativa Navi modelo Honda',
    16.0,
    '/images/products/navi/honda.webp',
    (SELECT id FROM categorias WHERE nombre = 'navi'),
    'CLP', true, 30
  ),
  (
    'Bender Chulo',
    'bender-chulo',
    12000, 14990,
    'Figura coleccionable de Bender',
    20.0,
    '/images/products/futurama/bender-chulo.webp',
    (SELECT id FROM categorias WHERE nombre = 'figuras'),
    'CLP', false, 25
  )
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE featured_productos (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position BETWEEN 1 AND 3),
  UNIQUE(position),
  UNIQUE(producto_id)
);

CREATE TABLE IF NOT EXISTS hero_images (
    id SERIAL PRIMARY KEY,
    section VARCHAR(20) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- En tu base de datos PostgreSQL:
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;


-- Tabla para calificaciones
CREATE TABLE IF NOT EXISTS valoraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    usuario_id INT,
    calificacion TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índice para mejorar rendimiento
CREATE INDEX idx_valoraciones_producto ON valoraciones(producto_id);