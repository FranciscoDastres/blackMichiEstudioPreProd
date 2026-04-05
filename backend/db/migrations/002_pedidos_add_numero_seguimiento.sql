-- Migración 002: agregar numero_seguimiento a pedidos
-- Solo necesaria para la DB existente en Supabase.
-- El schema 03_pedidos.sql ya lo incluye para instalaciones nuevas.

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS numero_seguimiento character varying(100);
