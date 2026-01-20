//CartContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const CartContext = createContext(null);

const CART_KEY = "cart";

function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeProduct(p) {
  return {
    id: p.id,
    titulo: p.titulo || p.nombre || p.name || "Producto",
    precio: Number(p.precio ?? p.price ?? 0),
    imagen: p.imagen_principal || p.imagen || p.image || null,
    stock: p.stock,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    const parsed = safeJsonParse(stored, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } else {
        localStorage.removeItem(CART_KEY);
      }
    } catch {
      // si localStorage falla, no rompas la app
    }
  }, [cart]);

  const addToCart = useCallback((product) => {
    const p = normalizeProduct(product);

    setCart((prev) => {
      const found = prev.find((item) => item.id === p.id);
      const stock = p.stock ?? Infinity;

      if (found) {
        const newQuantity = Math.min((found.quantity || 1) + 1, stock);
        return prev.map((item) =>
          item.id === p.id ? { ...item, ...p, quantity: newQuantity } : item
        );
      }

      if (stock <= 0) return prev;
      return [...prev, { ...p, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const stock = item.stock ?? Infinity;
        const next = Math.min(Math.max(1, Number(quantity)), stock);
        return { ...item, quantity: next };
      })
    );
  }, []);

  // ✅ LIMPIAR CARRITO Y LOCALSTORAGE INMEDIATAMENTE
  const clearCart = useCallback(() => {
    console.log('🗑️ clearCart ejecutado');
    setCart([]);

    try {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem('pendingOrder');

      // ✅ Disparar eventos
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cart-cleared'));

      console.log('✅ localStorage limpiado');
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }, []);


  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + (Number(item.quantity) || 0) * Number(item.precio || 0), 0),
    [cart]
  );

  const isStockExceeded = useCallback(
    (product) => {
      const p = normalizeProduct(product);
      const found = cart.find((item) => item.id === p.id);
      return !!found && p.stock !== undefined && (found.quantity || 0) >= p.stock;
    },
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isStockExceeded,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isStockExceeded]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
