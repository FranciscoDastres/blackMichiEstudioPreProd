-- Migración 003: renombrar direccion → direccion_defecto en usuarios
-- Alinea el nombre con la semántica real del campo (dirección de envío por defecto)
-- Idempotente: solo renombra si la columna vieja existe y la nueva no.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'direccion'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'direccion_defecto'
  ) THEN
    ALTER TABLE public.usuarios RENAME COLUMN direccion TO direccion_defecto;
  END IF;
END
$$;
