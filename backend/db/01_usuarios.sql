-- Tabla: usuarios
-- Sincronizado con Supabase — 2026-04-04

CREATE SEQUENCE IF NOT EXISTS usuarios_id_seq;

CREATE TABLE public.usuarios (
  id          integer        NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
  nombre      character varying NOT NULL,
  email       character varying NOT NULL UNIQUE,
  rol         character varying DEFAULT 'cliente'::character varying
                CHECK (rol::text = ANY (ARRAY['admin'::character varying, 'cliente'::character varying]::text[])),
  telefono    character varying,
  direccion_defecto text,
  email_verified boolean DEFAULT false,
  created_ip  character varying,
  activo      boolean DEFAULT true,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  auth_id     uuid,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
