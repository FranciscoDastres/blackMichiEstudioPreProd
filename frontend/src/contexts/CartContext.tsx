import { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  titulo: string;
  precio: number;
  imagen: string | null;
  stock: number;
  quantity: number;
}

/** Forma del producto que puede venir de la API o de componentes */
export interface RawProduct {
  id?: number | string;
  _id?: number | string;
  titulo?: string;
  nombre?: string;
  name?: string;
  precio?: number;
  price?: number;
  imagen_principal?: string;
  imagen?: string;
  image?: string;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: RawProduct) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isStockExceeded: (product: RawProduct) => boolean;
}

export const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "cart";

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeProduct(p: RawProduct): Omit<CartItem, 'quantity'> | null {
  if (!p || typeof p !== 'object') {
    console.warn('⚠️ normalizeProduct recibió valor inválido:', p);
    return null;
  }

  return {
    id: Number(p.id ?? p._id ?? Math.random()),
    titulo: p.titulo ?? p.nombre ?? p.name ?? "Producto",
    precio: Number(p.precio ?? p.price ?? 0),
    imagen: p.imagen_principal ?? p.imagen ?? p.image ?? null,
    stock: p.stock !== undefined ? p.stock : Infinity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_KEY);
    const parsed = safeJsonParse<CartItem[]>(stored, []);
    return Array.isArray(parsed) ? parsed : [];
  });

  // Siempre sincronizar localStorage con el estado actual — incluso cuando cart queda vacío
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

  const addToCart = useCallback((product: RawProduct) => {
    const p = normalizeProduct(product);
    if (!p) return;

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

  const removeFromCart = useCallback((productId: number | string) => {
    setCart((prev) => prev.filter((item) => item.id !== Number(productId)));
  }, []);

  const updateQuantity = useCallback((productId: number | string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== Number(productId)) return item;
        const stock = item.stock ?? Infinity;
        const next = Math.min(Math.max(1, Number(quantity)), stock);
        return { ...item, quantity: next };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    // 1. Borrar de localStorage de forma síncrona e inmediata
    try {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem('pendingOrder');
    } catch {
      // si localStorage falla, no rompas la app
    }

    // 2. Actualizar estado React (dispara el useEffect pero ya está vacío)
    setCart([]);

    // 3. Disparar eventos para que otros componentes (Header, etc.) se enteren
    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('cart-cleared'));
    } catch {
      // ignore
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
    (product: RawProduct): boolean => {
      const p = normalizeProduct(product);
      if (!p) return false;
      const found = cart.find((item) => item.id === p.id);
      return !!found && p.stock !== undefined && (found.quantity || 0) >= p.stock;
    },
    [cart]
  );

  const value = useMemo<CartContextType>(
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
