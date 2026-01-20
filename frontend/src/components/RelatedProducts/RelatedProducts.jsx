import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/api";
import useCart from "../../hooks/useCart";
import { ShoppingCart, Star, ChevronRight, ChevronLeft, Zap } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Utilidad para limpiar y formatear los nombres de productos y categorías
const formatTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

function RelatedProducts({ category = "todos" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, isStockExceeded } = useCart();

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchRelated = async () => {
      if (!category) return;
      try {
        setLoading(true);
        setError(null);
        // Intentamos obtener por categoría, si falla o viene vacío, usamos populares
        const data = await ApiService.getProductosPorCategoria(category);
        setProducts((data || []).slice(0, 15));
      } catch (err) {
        console.error("Error al cargar relacionados:", err);
        setError("No se pudieron cargar productos relacionados");
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [category]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left"
        ? scrollLeft - clientWidth / 1.5
        : scrollLeft + clientWidth / 1.5;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-12 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
      </div>
    );
  }

  if (error || products.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto mt-16 mb-20 px-4 sm:px-6 lg:px-8 border-t border-border/40 pt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-2">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Productos Relacionados
            </span>
          </h2>
          <p className="text-muted-foreground">Basado en la categoría: {formatTitle(category)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full border border-border bg-card hover:bg-secondary transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => {
            const outOfStock = isStockExceeded(product);
            const avgRating = product.promedio_calificacion
              ? Math.round(parseFloat(product.promedio_calificacion))
              : 0;

            const mainImg = product.imagen_principal
              ? `${API_BASE_URL}/${product.imagen_principal.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`
              : "/placeholder.svg";

            return (
              <article
                key={product.id}
                onClick={() => navigate(`/producto/${product.id}`)}
                className="min-w-[280px] max-w-[280px] group bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-accent/30 transition-all duration-500 cursor-pointer snap-start flex flex-col"
              >
                {/* Contenedor Imagen */}
                <div className="relative aspect-square overflow-hidden bg-secondary/20">
                  <img
                    src={mainImg}
                    alt={product.titulo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {product.descuento && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        -{product.descuento}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido Texto */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">
                    {formatTitle(product.categoria_nombre || category)}
                  </span>

                  <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors duration-300">
                    {formatTitle(product.titulo)}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < avgRating ? "fill-yellow-400 text-yellow-400" : "text-muted"}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex flex-col mb-4">
                      <span className="text-xl font-black text-foreground">
                        {CLP.format(product.precio)}
                      </span>
                      {product.precio_anterior && (
                        <span className="text-xs line-through text-muted-foreground">
                          {CLP.format(product.precio_anterior)}
                        </span>
                      )}
                    </div>

                    <button
                      disabled={outOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!outOfStock) addToCart(product);
                      }}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 ${outOfStock
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20 active:scale-95"
                        }`}
                    >
                      <ShoppingCart size={16} />
                      {outOfStock ? "Agotado" : "Agregar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Indicador de progreso visual */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent animate-pulse" style={{ width: '40%' }}></div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Explorar más
        </span>
      </div>
    </section>
  );
}

export default RelatedProducts;