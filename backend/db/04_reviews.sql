-- Tabla: valoraciones
-- Sincronizado con Supabase — 2026-04-04

CREATE SEQUENCE IF NOT EXISTS valoraciones_id_seq;

CREATE TABLE public.valoraciones (
  id          integer  NOT NULL DEFAULT nextval('valoraciones_id_seq'::regclass),
  producto_id integer  NOT NULL,
  usuario_id  integer,
  calificacion smallint NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario  text,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valoraciones_pkey PRIMARY KEY (id),
  CONSTRAINT valoraciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT valoraciones_usuario_id_fkey  FOREIGN KEY (usuario_id)  REFERENCES public.usuarios(id)
);
