// PopularProducts.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import useCart from "../../hooks/useCart";
import { ChevronRight, ChevronLeft, ShoppingCart, Star, Zap } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";

const formatTitle = (text) => {
  if (!text) return "";
  return text
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("todos");
  const navigate = useNavigate();
  const { addToCart, isStockExceeded } = useCart();

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/productos");
        setProducts(response.data.slice(0, 20));
      } catch (err) {
        console.error("❌ Error cargando populares:", err);
        setError("Error al cargar productos populares");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoriesTabs = [
    "todos",
    ...Array.from(
      new Set(
        products
          .map((p) => p.categoria_nombre)
          .filter((c) => typeof c === "string" && c.trim() !== "")
      )
    ),
  ];

  const visibleProducts =
    activeCategory === "todos"
      ? products
      : products.filter(
        (p) =>
          (p.categoria_nombre || "").toLowerCase() ===
          activeCategory.toLowerCase()
      );

  if (loading) {
    return (
      // ✅ FIX: más padding horizontal (px-8 sm:px-12 lg:px-16)
      <section className="w-full max-w-7xl mx-auto mt-4 mb-4 px-8 sm:px-12 lg:px-16 bg-grid rounded-xl">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              Productos Populares
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6">Los artículos más populares de nuestra colección</p>
        </div>
        <div className="flex justify-center items-center h-[600px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-accent/30"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !products.length) {
    return (
      // ✅ FIX: más padding horizontal
      <section className="w-full max-w-7xl mx-auto mt-4 mb-4 px-8 sm:px-12 lg:px-16 bg-grid rounded-xl">
        <div className="mb-10 text-center py-20">
          <Zap className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground">No hay productos disponibles</h3>
        </div>
      </section>
    );
  }

  return (
    // ✅ FIX 1: padding horizontal aumentado para dar más espacio a los lados
    <section className="w-full max-w-7xl mx-auto mt-4 mb-4 px-8 sm:px-12 lg:px-16 bg-grid rounded-xl">
      <div className="mb-10 pt-4" style={{ minHeight: '200px', maxHeight: '220px' }}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            Productos Populares
          </span>
        </h2>
        <p className="text-lg text-muted-foreground mb-6">Los artículos más populares de nuestra colección</p>
        <div className="flex flex-wrap gap-2 overflow-hidden" style={{ maxHeight: '120px' }}>
          {categoriesTabs.map((cat) => (
            <button
              key={cat || "otros"}
              aria-label={`Filtrar por ${cat === "todos" ? "todos los productos" : cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`group relative px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 overflow-hidden ${activeCategory === cat
                ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20"
                : "bg-background text-foreground border-border hover:border-accent/50 hover:shadow-md"
                }`}
            >
              <span className="relative z-10">{cat === "todos" ? "Todos" : formatTitle(cat)}</span>
              {activeCategory === cat && <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/80"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <button
          aria-label="Productos anteriores"
          // ✅ FIX: los botones de navegación ahora están fuera del contenedor con más espacio
          className="absolute -left-6 sm:-left-10 top-1/2 -translate-y-1/2 z-20 text-foreground/50 hover:text-accent transition-all duration-300 group/arrow"
          onClick={() => document.querySelector(".popular-products-container").scrollBy({ left: -400, behavior: "smooth" })}
        >
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover/arrow:-translate-x-2" />
        </button>

        <div
          className="popular-products-container flex gap-6 pb-6 overflow-x-auto scrollbar-hide px-2"
          // ✅ FIX 2: altura del contenedor aumentada para que las cards quepan con el botón visible
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", height: '600px' }}
        >
          {visibleProducts.map((product) => {
            const outOfStock = isStockExceeded(product);
            const primaryImage = product.imagen_principal;
            const additionalImages = product.imagenes_adicionales || [];
            const avgRating = product.promedio_calificacion
              ? Math.round(parseFloat(product.promedio_calificacion))
              : 0;

            return (
              <article
                key={product.id}
                // ✅ FIX 3: card más alta (h-[560px]) y con min-height para que nunca se corte el botón
                className="group relative flex-shrink-0 min-w-[300px] max-w-[300px] w-[300px] bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-accent/30 transition-all duration-500 hover:-translate-y-2 flex flex-col"
                style={{ height: '560px', minHeight: '560px' }}
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                {/* Imagen */}
                <div className="relative w-full h-60 bg-secondary/10 overflow-hidden flex-shrink-0">
                  <img
                    src={getImageUrl(primaryImage, 300, 240, 80)}
                    alt={product.titulo}
                    width="300"
                    height="240"
                    loading="lazy"
                    decoding="async"
                    srcSet={`${getImageUrl(primaryImage, 300, 240, 80)} 300w, ${getImageUrl(primaryImage, 600, 480, 80)} 600w`}
                    sizes="(max-width:768px) 100vw, 300px"
                    className="w-full h-full object-cover"
                  />
                  {additionalImages.length > 0 && (
                    <img
                      src={getImageUrl(additionalImages[0], 300, 240, 80)}
                      alt="Vista alternativa"
                      width="300"
                      height="240"
                      loading="lazy"
                      decoding="async"
                      srcSet={`${getImageUrl(additionalImages[0], 300, 240, 80)} 300w, ${getImageUrl(additionalImages[0], 600, 480, 80)} 600w`}
                      sizes="(max-width:768px) 100vw, 300px"
                      className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
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

                {/* ✅ FIX 4: contenido con flex-1 y justify-between para que el botón siempre quede abajo */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  {/* Info superior */}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter text-accent font-bold h-4 mb-1">
                      {product.categoria_nombre ? formatTitle(product.categoria_nombre) : ""}
                    </span>
                    <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors duration-300 h-12 overflow-hidden">
                      {formatTitle(product.titulo)}
                    </h3>
                    <div className="flex items-center gap-1 mb-3 h-5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < avgRating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`}
                          />
                        ))}
                      </div>
                      {product.total_valoraciones > 0 && (
                        <span className="text-xs text-muted ml-1">({product.total_valoraciones})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8 overflow-hidden">
                      {product.descripcion || "Sin descripción disponible"}
                    </p>
                  </div>

                  {/* Precio + Botón siempre al fondo */}
                  <div>
                    <div className="flex flex-col mb-4">
                      <span className="text-xl font-bold text-primary">{CLP.format(product.precio)}</span>
                      <div className="h-5">
                        {product.precio_anterior && (
                          <span className="line-through text-muted text-xs">{CLP.format(product.precio_anterior)}</span>
                        )}
                      </div>
                    </div>

                    {/* ✅ FIX 5: botón con altura fija garantizada y sin posibilidad de recortarse */}
                    <button
                      aria-label={outOfStock ? "Producto agotado" : `Agregar ${product.titulo} al carrito`}
                      className={`group/btn relative w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden flex-shrink-0 ${outOfStock
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
                      <span className="relative z-10">{outOfStock ? "Agotado" : "Agregar"}</span>
                      {!outOfStock && (
                        <ChevronRight className="w-4 h-4 relative z-10 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          aria-label="Productos siguientes"
          className="absolute -right-6 sm:-right-10 top-1/2 -translate-y-1/2 z-20 text-foreground/50 hover:text-accent transition-all duration-300 group/arrow"
          onClick={() => document.querySelector(".popular-products-container").scrollBy({ left: 400, behavior: "smooth" })}
        >
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover/arrow:translate-x-2" />
        </button>
      </div>

      <div className="flex justify-center items-center gap-2 mt-8">
        <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <span className="text-xs text-muted-foreground">Desliza para ver más productos</span>
      </div>
    </section>
  );
}

export default PopularProducts;
