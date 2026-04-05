-- Migración 001: eliminar columna duplicada telefono_contacto de pedidos
-- La información ya está en comprador_telefono

ALTER TABLE public.pedidos
  DROP COLUMN IF EXISTS telefono_contacto;
