-- Migración 003: renombrar direccion → direccion_defecto en usuarios
-- Alinea el nombre con la semántica real del campo (dirección de envío por defecto)

ALTER TABLE public.usuarios
  RENAME COLUMN direccion TO direccion_defecto;
