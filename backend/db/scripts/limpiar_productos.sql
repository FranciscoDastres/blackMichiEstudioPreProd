-- =============================================
-- 🔍 PRIMERO: Ver qué vamos a eliminar
-- =============================================

-- Productos desactivados o problemáticos
SELECT 'Producto' as tipo, id, titulo, slug, activo 
FROM productos 
WHERE id IN (38, 47) OR activo = false;

-- Categorías que podrían quedar vacías
SELECT 'Categoría' as tipo, c.id, c.nombre
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = true
WHERE p.id IS NULL;

-- Items de pedidos asociados
SELECT 'Pedido Item' as tipo, pi.id, pi.producto_id, p.titulo
FROM pedido_items pi
JOIN productos p ON pi.producto_id = p.id
WHERE p.id IN (38, 47);


-- =============================================
-- 🗑️ LIMPIEZA: Eliminar en orden correcto
-- =============================================

-- Paso 1: Eliminar items de pedidos asociados
DELETE FROM pedido_items 
WHERE producto_id IN (38, 47);

-- Paso 2: Eliminar los productos problemáticos
DELETE FROM productos 
WHERE id IN (38, 47);

-- Paso 3: Eliminar categorías que ya no tienen productos activos
DELETE FROM categorias 
WHERE id NOT IN (
    SELECT DISTINCT categoria_id 
    FROM productos 
    WHERE activo = true AND categoria_id IS NOT NULL
);

-- Paso 4: Limpiar cualquier producto con categoría inválida (opcional)
UPDATE productos 
SET categoria_id = NULL 
WHERE categoria_id NOT IN (SELECT id FROM categorias);


-- =============================================
-- ✅ VERIFICACIÓN FINAL
-- =============================================

-- Ver productos restantes
SELECT COUNT(*) as productos_activos 
FROM productos 
WHERE activo = true;

-- Ver categorías restantes
SELECT id, nombre 
FROM categorias 
ORDER BY nombre;

-- Ver si quedaron pedidos huérfanos (debería ser 0)
SELECT COUNT(*) as pedidos_huerfanos
FROM pedido_items pi
LEFT JOIN productos p ON pi.producto_id = p.id
WHERE p.id IS NULL;

-- =============================================
-- ✅ BORRAR TODO EN CASCADA (opcional)
-- =============================================

ALTER TABLE pedido_items
DROP CONSTRAINT pedido_items_producto_id_fkey,
ADD CONSTRAINT pedido_items_producto_id_fkey
FOREIGN KEY (producto_id)
REFERENCES productos(id)
ON DELETE CASCADE;
-- =============================================
-- ✅ BORRAR TODOS LOS PRODUCTOS (opcional)
-- =============================================

DELETE FROM pedido_items;
DELETE FROM productos;