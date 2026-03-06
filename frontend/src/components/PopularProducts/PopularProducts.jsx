import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import useCart from "../../hooks/useCart";
import { ChevronRight, ChevronLeft, ShoppingCart, Star, Zap } from "lucide-react";

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
        const limited = response.data.slice(0, 20);
        setProducts(limited);
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

  // 🔥 FUNCIÓN DE IMAGEN OPTIMIZADA
  const getImageUrl = (imagePath, width = 600) => {
    if (!imagePath) return "/placeholder.svg";

    if (imagePath.startsWith("http")) {
      if (imagePath.includes("supabase.co")) {
        return `${imagePath}?width=${width}&quality=60&format=webp`;
      }
      return imagePath;
    }

    const baseURL = api.defaults.baseURL?.replace("/api", "") || "";
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

    return `${baseURL}${cleanPath}?width=${width}&quality=60&format=webp`;
  };

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto mt-4 mb-4 px-4 sm:px-6 lg:px-8 bg-grid rounded-xl">
        <div className="flex gap-6 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[300px] max-w-[300px] h-[550px] rounded-2xl bg-secondary/10 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !products.length) {
    return (
      <section className="w-full max-w-7xl mx-auto mt-4 mb-4 px-4 sm:px-6 lg:px-8 bg-grid rounded-xl">
        <div className="mb-10 text-center py-20">
          <Zap className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground">
            No hay productos disponibles
          </h3>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto mt-4 mb-4 px-4 sm:px-6 lg:px-8 bg-grid rounded-xl">
      <div className="relative">

        <button
          className="absolute -left-4 sm:-left-8 top-1/2 -translate-y-1/2 z-20"
          onClick={() =>
            document
              .querySelector(".popular-products-container")
              .scrollBy({ left: -400, behavior: "smooth" })
          }
        >
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>

        <div className="popular-products-container flex gap-6 pb-6 overflow-x-auto px-2">

          {visibleProducts.map((product, productIndex) => {

            const outOfStock = isStockExceeded(product);
            const primaryImage = product.imagen_principal;
            const additionalImages = product.imagenes_adicionales || [];

            const avgRating = product.promedio_calificacion
              ? Math.round(parseFloat(product.promedio_calificacion))
              : 0;

            return (
              <article
                key={product.id}
                className="group relative min-w-[300px] max-w-[300px] h-[550px] bg-card rounded-2xl border overflow-hidden cursor-pointer flex flex-col"
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                <div className="relative w-full h-60 bg-secondary/10 overflow-hidden">

                  {/* IMAGEN PRINCIPAL OPTIMIZADA */}
                  <img
                    src={getImageUrl(primaryImage, 300)}
                    srcSet={`
                      ${getImageUrl(primaryImage, 300)} 300w,
                      ${getImageUrl(primaryImage, 600)} 600w,
                      ${getImageUrl(primaryImage, 900)} 900w
                    `}
                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 600px, 900px"
                    alt={product.titulo}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading={productIndex < 2 ? "eager" : "lazy"}
                    fetchPriority={productIndex < 2 ? "high" : "low"}
                    decoding="async"
                    width={300}
                    height={400}
                  />

                  {/* IMAGEN HOVER */}
                  {additionalImages.length > 0 && (
                    <img
                      data-src={getImageUrl(additionalImages[0], 600)}
                      className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                      alt="Hover view"
                      onMouseEnter={(e) => {
                        if (e.target.dataset.src && !e.target.src) {
                          e.target.src = e.target.dataset.src;
                          e.target.removeAttribute("data-src");
                        }
                      }}
                      decoding="async"
                    />
                  )}

                </div>

                <div className="p-5 flex flex-col flex-1">

                  <h3 className="font-bold text-base mb-2">
                    {formatTitle(product.titulo)}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
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

                  <div className="mt-auto mb-4">
                    <span className="text-xl font-bold text-primary">
                      {CLP.format(product.precio)}
                    </span>
                  </div>

                  <button
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-sky-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      !outOfStock && addToCart(product);
                    }}
                    disabled={outOfStock}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {outOfStock ? "Agotado" : "Agregar"}
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              </article>
            );
          })}
        </div>

        <button
          className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 z-20"
          onClick={() =>
            document
              .querySelector(".popular-products-container")
              .scrollBy({ left: 400, behavior: "smooth" })
          }
        >
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>
      </div>
    </section>
  );
}

export default PopularProducts;