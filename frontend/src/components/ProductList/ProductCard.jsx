import LazyImage from "../LazyImage/LazyImage";
import { getImageUrl } from "../../utils/getImageUrl";

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
