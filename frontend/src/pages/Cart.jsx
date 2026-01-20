// Cart.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";

function Cart() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();

  const CLP = useMemo(
    () => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }),
    []
  );

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-20 text-muted">
        Tu carrito está vacío.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-background rounded-xl shadow border border-border">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Carrito de compras</h2>

      <ul className="divide-y divide-border">
        {cart.map((item) => {
          const title = item.titulo || item.nombre || item.name || "Producto";
          const qty = Number(item.quantity) || 1;
          const price = Number(item.precio) || 0;

          return (
            <li key={item.id} className="flex justify-between py-3 items-center gap-3">
              <div className="flex-1 min-w-0">
                <span className="block truncate font-medium text-foreground">{title}</span>
                <span className="text-xs text-muted">{CLP.format(price)} c/u</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, qty - 1)}
                  disabled={qty <= 1}
                  className="px-2 py-1 border border-border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Disminuir cantidad de ${title}`}
                >
                  -
                </button>

                <span className="w-8 text-center text-foreground">{qty}</span>

                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, qty + 1)}
                  className="px-2 py-1 border border-border rounded hover:bg-muted/20"
                  aria-label={`Aumentar cantidad de ${title}`}
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-primary hover:text-primary/80 text-sm"
                >
                  Quitar
                </button>
              </div>

              <div className="w-28 text-right font-semibold text-foreground">
                {CLP.format(price * qty)}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between mt-6 font-bold text-lg text-foreground">
        <span>Total {cartCount} productos</span>
        <span>{CLP.format(cartTotal)}</span>
      </div>

      <button
        type="button"
        className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => navigate("/checkout")}
        aria-label="Ir a pagar"
        disabled={cartCount === 0}
      >
        Ir a pagar
      </button>

      <button
        type="button"
        className="mt-2 w-full text-xs text-muted underline"
        onClick={clearCart}
      >
        Vaciar carrito
      </button>
    </div>
  );
}

export default Cart;