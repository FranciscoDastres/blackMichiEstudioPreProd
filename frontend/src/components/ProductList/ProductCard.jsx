import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LazyImage from "../LazyImage/LazyImage";
import { getImageUrl } from "../../utils/getImageUrl";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useAuth } from "../../contexts/AuthContext";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const StarIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? "text-yellow-400 fill-yellow-400" : "text-muted fill-muted"}`}
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.16 12 17.77 5.82 21.16 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function ProductCard({
  product,
  onClick,
  onAddToCart,
  outOfStock,
}) {
  const primaryImage = product.imagen_principal;
  const additionalImages = product.imagenes_adicionales || [];
  const avgRating = product.promedio_calificacion
    ? Math.round(parseFloat(product.promedio_calificacion))
    : 0;
  const stock = Number(product.stock ?? 99);
  const lowStock = stock > 0 && stock < 5;

  const { isFavorite, toggle } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fav = isFavorite(product.id);

  const handleFavClick = async (e) => {
    e.stopPropagation();
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

  return (
    <div
      className="group bg-background rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 flex flex-col"
      onClick={() => onClick(product)}
    >
      {/* Imagen */}
      <div className="relative w-full h-52 bg-muted/20 overflow-hidden">
        <LazyImage
          src={getImageUrl(primaryImage)}
          alt={product.titulo}
          width={300}
          height={300}
          sizes="(max-width: 768px) 50vw, 300px"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {additionalImages.length > 0 && (
          <LazyImage
            src={getImageUrl(additionalImages[0])}
            alt={`${product.titulo} alternativa`}
            width={300}
            height={300}
            sizes="(max-width: 768px) 50vw, 300px"
            className="hover-image w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Botón favorito */}
        <button
          type="button"
          aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={handleFavClick}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-background/90 backdrop-blur border border-border shadow-sm flex items-center justify-center hover:bg-background transition-colors z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              fav ? "text-rose-500 fill-rose-500" : "text-muted"
            }`}
          />
        </button>

        {/* Badge pocos disponibles */}
        {lowStock && (
          <span className="absolute top-2 left-2 bg-amber-500/90 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            ¡Pocos disponibles!
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2">
          {product.titulo}
        </h3>

        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < avgRating} />
          ))}
          {product.total_valoraciones > 0 && (
            <span className="ml-1 text-xs text-muted">
              ({product.total_valoraciones})
            </span>
          )}
        </div>

        <div className="mb-3">
          <span className="text-lg font-bold text-primary">
            {CLP.format(product.precio || 0)}
          </span>
        </div>

        <button
          className={`w-full py-2 rounded-xl font-semibold text-sm mt-auto transition-colors ${
            outOfStock
              ? "bg-muted text-muted cursor-not-allowed"
              : "border border-primary text-primary hover:bg-primary/10"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!outOfStock) onAddToCart(product);
          }}
          disabled={outOfStock}
        >
          {outOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
