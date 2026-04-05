-- Migración 004: crear tabla favoritos

CREATE SEQUENCE IF NOT EXISTS favoritos_id_seq;

CREATE TABLE IF NOT EXISTS public.favoritos (
  id          integer NOT NULL DEFAULT nextval('favoritos_id_seq'::regclass),
  usuario_id  integer NOT NULL,
  producto_id integer NOT NULL,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT favoritos_pkey PRIMARY KEY (id),
  CONSTRAINT favoritos_usuario_producto_unique UNIQUE (usuario_id, producto_id),
  CONSTRAINT favoritos_usuario_id_fkey  FOREIGN KEY (usuario_id)  REFERENCES public.usuarios(id)  ON DELETE CASCADE,
  CONSTRAINT favoritos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE
);
