-- Tablas: pedidos, pedido_items, flow_webhooks
-- Sincronizado con Supabase — 2026-04-04

CREATE SEQUENCE IF NOT EXISTS pedidos_id_seq;
CREATE SEQUENCE IF NOT EXISTS pedido_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS flow_webhooks_id_seq;

-- ─── Pedidos ──────────────────────────────────────────────────────────────────

CREATE TABLE public.pedidos (
  id                 integer        NOT NULL DEFAULT nextval('pedidos_id_seq'::regclass),
  usuario_id         integer,
  comprador_nombre   character varying NOT NULL,
  comprador_email    character varying NOT NULL,
  comprador_telefono character varying,
  direccion_envio    text           NOT NULL,
  total              numeric        NOT NULL,
  costo_envio        numeric        DEFAULT 3500,
  notas              text,
  estado             character varying DEFAULT 'pendiente'::character varying
                       CHECK (estado::text = ANY (ARRAY[
                         'pendiente','pagado','confirmado','en_proceso',
                         'enviado','entregado','cancelado','rechazado'
                       ]::text[])),
  commerce_order     character varying NOT NULL UNIQUE,
  flow_order         character varying,
  flow_token         character varying,
  flow_status        integer,
  flow_payment_data  jsonb,
  metodo_pago        character varying DEFAULT 'flow'::character varying,
  payment_id         character varying,
  numero_seguimiento character varying(100),
  fecha_pago         timestamp without time zone,
  fecha_envio        timestamp without time zone,
  fecha_entrega      timestamp without time zone,
  created_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_commerce_order ON pedidos(commerce_order);
CREATE INDEX IF NOT EXISTS idx_pedidos_flow_order ON pedidos(flow_order);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(comprador_email);

-- ─── Pedido items ─────────────────────────────────────────────────────────────

CREATE TABLE public.pedido_items (
  id               integer NOT NULL DEFAULT nextval('pedido_items_id_seq'::regclass),
  pedido_id        integer NOT NULL,
  producto_id      integer,
  producto_titulo  character varying NOT NULL,
  producto_imagen  character varying,
  cantidad         integer NOT NULL CHECK (cantidad > 0),
  precio_unitario  numeric NOT NULL,
  subtotal         numeric NOT NULL,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pedido_items_pkey PRIMARY KEY (id),
  CONSTRAINT pedido_items_pedido_id_fkey   FOREIGN KEY (pedido_id)   REFERENCES public.pedidos(id),
  CONSTRAINT pedido_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);

-- ─── Flow webhooks ────────────────────────────────────────────────────────────

CREATE TABLE public.flow_webhooks (
  id               integer NOT NULL DEFAULT nextval('flow_webhooks_id_seq'::regclass),
  pedido_id        integer,
  token            character varying NOT NULL,
  flow_order       character varying,
  flow_status      integer,
  request_body     jsonb   NOT NULL,
  request_headers  jsonb,
  processed        boolean DEFAULT false,
  processing_error text,
  ip_origen        character varying,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT flow_webhooks_pkey PRIMARY KEY (id),
  CONSTRAINT flow_webhooks_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id)
);

CREATE INDEX IF NOT EXISTS idx_flow_webhooks_token     ON flow_webhooks(token);
CREATE INDEX IF NOT EXISTS idx_flow_webhooks_pedido_id ON flow_webhooks(pedido_id);
CREATE INDEX IF NOT EXISTS idx_flow_webhooks_processed ON flow_webhooks(processed);
