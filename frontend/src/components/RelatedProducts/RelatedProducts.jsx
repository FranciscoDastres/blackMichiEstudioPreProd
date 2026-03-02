import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import useCart from "../../hooks/useCart";
import { ShoppingCart, Star, ChevronRight, ChevronLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

function RelatedProducts({ category = "vasos3d" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();
  const { addToCart, isStockExceeded } = useCart();

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      try {
        setLoading(true);
        setError(null);
        const data = await api.get(`/productos/categoria/${category}`);
        setProducts((data || []).slice(0, 20));
      } catch (err) {
        setError("No hay productos relacionados disponibles.");
        console.error("Error al cargar productos relacionados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  if (error || !products.length) return null;

  if (loading) {
    return (
      <section className="w-full max-w-6xl mx-auto mt-16 mb-20 px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              Productos Relacionados
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">Descubre más productos que podrían interesarte</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-accent/30"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-6xl mx-auto mt-16 mb-20 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            Productos Relacionados
          </span>
        </h2>
        <p className="text-lg text-muted-foreground">Descubre más productos que podrían interesarte</p>
      </div>

      {/* Contenedor del carousel */}
      <div className="relative">
        <button
          className="absolute -left-4 sm:-left-8 top-1/2 -translate-y-1/2 z-20 text-foreground/50 hover:text-accent transition-all duration-300 group/arrow"
          onClick={() => document.querySelector(".related-products-container").scrollBy({ left: -400, behavior: "smooth" })}
        >
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover/arrow:-translate-x-2" />
        </button>

        <div
          className="related-products-container flex gap-6 pb-6 overflow-x-auto scrollbar-hide px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => {
            const outOfStock = isStockExceeded(product);
            const primaryImage = product.imagen_principal;
            const additionalImages = product.imagenes_adicionales || [];

            // 👇 Calificación promedio desde la base de datos
            const avgRating = product.promedio_calificacion
              ? Math.round(parseFloat(product.promedio_calificacion))
              : 0;

            return (
              <article
                key={product.id}
                className="group relative min-w-[300px] max-w-[300px] h-[550px] bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-accent/30 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                onClick={() => navigate(`/producto/${product.id}`)}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Imagen */}
                <div className="relative w-full h-60 min-h-[240px] bg-secondary/10 overflow-hidden">
                  <img
                    src={primaryImage ? `${API_BASE_URL}${primaryImage.startsWith("/") ? "" : "/"}${primaryImage.replace(/\.(jpg|jpeg|png)$/i, '.webp')}` : "/placeholder.svg"}
                    alt={product.titulo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {additionalImages.length > 0 && (
                    <img
                      src={`${API_BASE_URL}${additionalImages[0].startsWith("/") ? "" : "/"}${additionalImages[0]}`.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
                      className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                      alt="Hover view"
                    />
                  )}
                  {product.descuento && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        -{product.descuento}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Categoría */}
                  <span className="text-[10px] uppercase tracking-tighter text-accent font-bold h-4 mb-1">
                    {product.categoria_nombre ? formatTitle(product.categoria_nombre) : ""}
                  </span>

                  {/* Título */}
                  <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors duration-300 h-12 overflow-hidden">
                    {formatTitle(product.titulo)}
                  </h3>

                  {/* Rating - Dinámico desde DB */}
                  <div className="flex items-center gap-1 mb-3 h-5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < avgRating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted"
                            }`}
                        />
                      ))}
                    </div>
                    {product.total_valoraciones > 0 && (
                      <span className="text-xs text-muted ml-1">
                        ({product.total_valoraciones})
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8 overflow-hidden">
                    {product.descripcion || "Sin descripción disponible"}
                  </p>

                  {/* Precios */}
                  <div className="mt-auto mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-primary">
                        {CLP.format(product.precio)}
                      </span>
                      <div className="h-5">
                        {product.precio_anterior && (
                          <span className="line-through text-muted text-xs">
                            {CLP.format(product.precio_anterior)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón */}
                  <button
                    className={`group/btn relative w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${outOfStock
                      ? "bg-muted/30 text-muted-foreground cursor-not-allowed border border-muted"
                      : "bg-sky-600 text-white border-2 border-sky-400/50 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:-translate-y-1"
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      !outOfStock && addToCart(product);
                    }}
                    disabled={outOfStock}
                  >
                    {!outOfStock && (
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    )}

                    <ShoppingCart className={`w-4 h-4 relative z-10 ${outOfStock ? "" : "group-hover/btn:scale-110 transition-transform"}`} />
                    <span className="relative z-10">
                      {outOfStock ? "Agotado" : "Agregar"}
                    </span>

                    {!outOfStock && (
                      <ChevronRight className="w-4 h-4 relative z-10 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <button
          className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 z-20 text-foreground/50 hover:text-accent transition-all duration-300 group/arrow"
          onClick={() => document.querySelector(".related-products-container").scrollBy({ left: 400, behavior: "smooth" })}
        >
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover/arrow:translate-x-2" />
        </button>
      </div>

      {/* Indicador de scroll */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <span className="text-xs text-muted-foreground">Desliza para ver más productos</span>
      </div>
    </section>
  );
}

export default RelatedProducts;