-- Migration 006 — Sistema de cupones/descuentos
-- Fecha: 2026-04-14

CREATE SEQUENCE IF NOT EXISTS cupones_id_seq;

CREATE TABLE IF NOT EXISTS public.cupones (
  id                integer NOT NULL DEFAULT nextval('cupones_id_seq'::regclass),
  codigo            character varying(50) NOT NULL UNIQUE,
  descripcion       text,
  tipo              character varying(20) NOT NULL
                      CHECK (tipo IN ('porcentaje', 'monto_fijo')),
  valor             numeric NOT NULL CHECK (valor > 0),
  monto_minimo      numeric DEFAULT 0,
  usos_maximos      integer,                -- NULL = ilimitado
  usos_actuales     integer NOT NULL DEFAULT 0,
  fecha_expiracion  timestamp without time zone,
  activo            boolean NOT NULL DEFAULT true,
  created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cupones_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);
CREATE INDEX IF NOT EXISTS idx_cupones_activo ON cupones(activo);

-- Añadir columnas de cupón a pedidos
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS cupon_codigo  character varying(50),
  ADD COLUMN IF NOT EXISTS cupon_id      integer REFERENCES public.cupones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS descuento     numeric DEFAULT 0;
