-- Migración 005: crear tabla configuracion con seed de valores base

CREATE SEQUENCE IF NOT EXISTS configuracion_id_seq;

CREATE TABLE IF NOT EXISTS public.configuracion (
  id          integer        NOT NULL DEFAULT nextval('configuracion_id_seq'::regclass),
  clave       character varying NOT NULL UNIQUE,
  valor       text           NOT NULL,
  descripcion text,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT configuracion_pkey PRIMARY KEY (id)
);

INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
  ('costo_envio',    '3500',           'Costo de envío estándar en CLP'),
  ('nombre_tienda',  'Black Michi',    'Nombre público de la tienda'),
  ('moneda',         'CLP',            'Moneda utilizada en transacciones')
ON CONFLICT (clave) DO NOTHING;
