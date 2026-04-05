-- Triggers: updated_at + promedio_calificacion / total_valoraciones
-- Sincronizado con Supabase — 2026-04-04

-- ─── Función genérica updated_at ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ─── Triggers updated_at por tabla ───────────────────────────────────────────

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_hero_images_updated_at
  BEFORE UPDATE ON public.hero_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_configuracion_updated_at
  BEFORE UPDATE ON public.configuracion
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Función: recalcular promedio y total de valoraciones ─────────────────────

CREATE OR REPLACE FUNCTION public.recalcular_valoraciones_producto()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_producto_id integer;
BEGIN
  -- Determinar el producto_id afectado (INSERT/UPDATE usan NEW, DELETE usa OLD)
  IF TG_OP = 'DELETE' THEN
    v_producto_id := OLD.producto_id;
  ELSE
    v_producto_id := NEW.producto_id;
  END IF;

  UPDATE public.productos
  SET
    promedio_calificacion = COALESCE((
      SELECT ROUND(AVG(calificacion)::numeric, 2)
      FROM public.valoraciones
      WHERE producto_id = v_producto_id
    ), 0),
    total_valoraciones = (
      SELECT COUNT(*)
      FROM public.valoraciones
      WHERE producto_id = v_producto_id
    )
  WHERE id = v_producto_id;

  RETURN NULL;
END;
$$;

-- ─── Trigger: actualizar producto al modificar valoraciones ───────────────────

CREATE TRIGGER trg_valoraciones_sync_producto
  AFTER INSERT OR UPDATE OR DELETE ON public.valoraciones
  FOR EACH ROW EXECUTE FUNCTION public.recalcular_valoraciones_producto();
