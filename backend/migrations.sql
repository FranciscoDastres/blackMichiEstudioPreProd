DROP TABLE IF EXISTS orders CASCADE;

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS comprador_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS comprador_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS comprador_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS costo_envio DECIMAL(10,2) DEFAULT 3500,
ADD COLUMN IF NOT EXISTS commerce_order VARCHAR(255),
ADD COLUMN IF NOT EXISTS flow_order VARCHAR(255),
ADD COLUMN IF NOT EXISTS flow_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS flow_status INTEGER,
ADD COLUMN IF NOT EXISTS flow_payment_data JSONB,
ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP;

ALTER TABLE pedidos ADD CONSTRAINT pedidos_commerce_order_unique UNIQUE (commerce_order);
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estado_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estado_check CHECK (estado IN ('pendiente','pagado','confirmado','en_proceso','enviado','entregado','cancelado','rechazado'));

CREATE INDEX IF NOT EXISTS idx_pedidos_commerce_order ON pedidos(commerce_order);
CREATE INDEX IF NOT EXISTS idx_pedidos_flow_order ON pedidos(flow_order);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(comprador_email);

CREATE TABLE IF NOT EXISTS flow_webhooks (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  flow_order VARCHAR(255),
  flow_status INTEGER,
  request_body JSONB NOT NULL,
  request_headers JSONB,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  ip_origen VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flow_webhooks_token ON flow_webhooks(token);
CREATE INDEX IF NOT EXISTS idx_flow_webhooks_pedido_id ON flow_webhooks(pedido_id);
CREATE INDEX IF NOT EXISTS idx_flow_webhooks_processed ON flow_webhooks(processed);

ALTER TABLE pedido_items 
ADD COLUMN IF NOT EXISTS producto_titulo VARCHAR(200),
ADD COLUMN IF NOT EXISTS producto_imagen VARCHAR(500);
