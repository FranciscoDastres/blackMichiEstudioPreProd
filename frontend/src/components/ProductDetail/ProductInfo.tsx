import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Star,
  ShoppingBag,
  Truck,
  Shield,
  Plus,
  Minus,
  Check,
  Package,
  Heart,
  AlertCircle,
} from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useAuth } from "../../contexts/AuthContext";
import { RawProduct } from "../../contexts/CartContext";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

interface ApiProduct {
  id: number;
  titulo?: string;
  precio?: number;
  precio_anterior?: number;
  descuento?: number;
  stock?: number;
  descripcion?: string;
  imagen_principal?: string;
  categoria_nombre?: string;
}

interface Review {
  id: string | number;
}

interface ProductInfoProps {
  product: ApiProduct;
  reviews: Review[];
  avgRating: number;
  onReviewsClick: () => void;
  addToCart: (product: RawProduct) => void;
  isStockExceeded: (product: RawProduct) => boolean;
}

export default function ProductInfo({
  product,
  reviews,
  avgRating,
  onReviewsClick,
  addToCart,
  isStockExceeded,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(product.id);

  const stock = product.stock ?? 99;
  const maxQty = Math.max(1, stock);
  const outOfStock = isStockExceeded(product);
  const lowStock = stock > 0 && stock < 5;

  const handleToggleFav = async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar favoritos");
      navigate("/login");
      return;
    }
    try {
      await toggle(product.id);
      toast.success(fav ? "Quitado de favoritos" : "Agregado a favoritos");
    } catch {
      toast.error("No se pudo actualizar favoritos");
    }
  };

  const handleAdd = () => {
    if (outOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        titulo: product.titulo,
        precio: product.precio,
        imagen: getImageUrl(product.imagen_principal),
        stock: product.stock,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Título */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
        {product.titulo || "Producto"}
      </h1>

      {/* Categoría */}
      {product.categoria_nombre && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Categoría:</span>
          <span className="font-semibold text-primary">
            {product.categoria_nombre}
          </span>
        </div>
      )}

      {/* Rating + stock */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 fill-current ${
                star <= Math.round(avgRating)
                  ? "text-yellow-400"
                  : "text-muted/30"
              }`}
            />
          ))}
        </div>
        <button
          onClick={onReviewsClick}
          className="text-sm text-primary hover:underline"
        >
          Reseña ({reviews.length})
        </button>
        <span className="w-px h-4 bg-border inline-block" />
        <span
          className={`text-sm font-semibold ${
            stock > 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {stock > 0 ? `En stock: ${stock} unidades` : "Agotado"}
        </span>
      </div>

      {/* Aviso pocos disponibles */}
      {lowStock && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          ¡Solo quedan {stock} disponibles! Aprovecha antes de que se agote.
        </div>
      )}

      {/* Precio */}
      <div className="flex items-center gap-4 py-4 border-y border-border">
        <span className="text-4xl font-bold text-primary">
          {CLP.format(product.precio || 0)}
        </span>
        {product.precio_anterior && (
          <span className="text-xl line-through text-muted">
            {CLP.format(product.precio_anterior)}
          </span>
        )}
        {product.descuento && (
          <span className="px-2 py-0.5 text-sm font-bold bg-emerald-500/10 text-emerald-400 rounded-full">
            {product.descuento}% OFF
          </span>
        )}
      </div>

      {/* Descripción corta */}
      {product.descripcion && (
        <p className="text-muted leading-relaxed text-sm">
          {product.descripcion}
        </p>
      )}

      {/* Cantidad + botón */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-secondary/20">
          <button
            aria-label="Restar cantidad"
            onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
            disabled={quantity === 1}
            className="w-10 h-12 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-bold text-foreground">
            {quantity}
          </span>
          <button
            aria-label="Sumar cantidad"
            onClick={() => setQuantity((q) => Math.min(q + 1, maxQty))}
            disabled={quantity === maxQty}
            className="w-10 h-12 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-5 h-5" />
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>

        <button
          onClick={handleToggleFav}
          aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={`h-12 w-12 flex items-center justify-center rounded-lg border transition-colors ${
            fav
              ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
              : "bg-secondary/20 border-border text-muted hover:text-rose-500 hover:border-rose-500/40"
          }`}
        >
          <Heart className={`w-5 h-5 ${fav ? "fill-rose-500" : ""}`} />
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Truck className="w-4 h-4 text-primary shrink-0" />
          <span>Envío en 3-5 días</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <span>Garantía 30 días</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Check className="w-4 h-4 text-primary shrink-0" />
          <span>Impuesto incluido</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Package className="w-4 h-4 text-primary shrink-0" />
          <span>Fabricación a pedido</span>
        </div>
      </div>
    </div>
  );
}
