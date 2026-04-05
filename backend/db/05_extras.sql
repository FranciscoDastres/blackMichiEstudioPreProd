-- Tablas: favoritos, configuracion
-- Nuevas tablas — 2026-04-04

CREATE SEQUENCE IF NOT EXISTS favoritos_id_seq;
CREATE SEQUENCE IF NOT EXISTS configuracion_id_seq;

-- ─── Favoritos ────────────────────────────────────────────────────────────────

CREATE TABLE public.favoritos (
  id          integer NOT NULL DEFAULT nextval('favoritos_id_seq'::regclass),
  usuario_id  integer NOT NULL,
  producto_id integer NOT NULL,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_usuario_producto_unique UNIQUE (usuario_id, producto_id),
  CONSTRAINT favoritos_usuario_id_fkey  FOREIGN KEY (usuario_id)  REFERENCES public.usuarios(id)  ON DELETE CASCADE,
  CONSTRAINT favoritos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE
);

-- ─── Configuracion ────────────────────────────────────────────────────────────

CREATE TABLE public.configuracion (
  id          integer        NOT NULL DEFAULT nextval('configuracion_id_seq'::regclass),
  clave       character varying NOT NULL UNIQUE,
  valor       text           NOT NULL,
  descripcion text,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT configuracion_pkey PRIMARY KEY (id)
);

-- Seed: valores base
INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
  ('costo_envio',    '3500',           'Costo de envío estándar en CLP'),
  ('nombre_tienda',  'Black Michi',    'Nombre público de la tienda'),
  ('moneda',         'CLP',            'Moneda utilizada en transacciones')
ON CONFLICT (clave) DO NOTHING;
