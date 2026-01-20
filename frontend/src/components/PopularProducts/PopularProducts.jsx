import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/api";
import useCart from "../../hooks/useCart";
import { ChevronRight, ChevronLeft, ShoppingCart, Star, Zap } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatTitle = (text) => {
  if (!text) return "";
  return text.replace(/-/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("todos");
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, isStockExceeded } = useCart();

  const CLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await ApiService.getProductos();
        setProducts(allProducts.slice(0, 20));
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["todos", ...new Set(products.map(p => p.categoria_nombre).filter(Boolean))];
  const visibleProducts = activeCategory === "todos" ? products : products.filter(p => p.categoria_nombre === activeCategory);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Zap className="animate-pulse text-accent w-12 h-12" /></div>;

  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Productos Populares
          </h2>
          <p className="text-muted-foreground text-lg">Lo más buscado de nuestra tienda.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat ? "bg-accent text-white shadow-lg scale-105" : "bg-secondary/50 hover:bg-secondary text-foreground"
                }`}
            >
              {cat === "todos" ? "Todos" : formatTitle(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <button onClick={() => scroll("left")} className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-background/80 backdrop-blur-md rounded-full shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft />
        </button>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 snap-x">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} isStockExceeded={isStockExceeded} CLP={CLP} />
          ))}
        </div>

        <button onClick={() => scroll("right")} className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-background/80 backdrop-blur-md rounded-full shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}

// Sub-componente para evitar repetición
function ProductCard({ product, navigate, addToCart, isStockExceeded, CLP }) {
  const outOfStock = isStockExceeded(product);
  const imgUrl = product.imagen_principal ? `${API_BASE_URL}/${product.imagen_principal.replace(/\.(jpg|jpeg|png)$/i, '.webp')}` : "/placeholder.svg";

  return (
    <div
      onClick={() => navigate(`/producto/${product.id}`)}
      className="min-w-[280px] group bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer snap-start"
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={imgUrl} alt={product.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        {product.descuento && (
          <span className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">-{product.descuento}%</span>
        )}
      </div>
      <div className="p-5">
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{product.categoria_nombre}</span>
        <h3 className="font-bold text-lg line-clamp-1 mt-1">{formatTitle(product.titulo)}</h3>
        <div className="flex items-center gap-1 my-2">
          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.round(product.promedio_calificacion || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />)}
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-2xl font-black text-foreground">{CLP.format(product.precio)}</span>
          {product.precio_anterior && <span className="text-xs line-through text-muted-foreground">{CLP.format(product.precio_anterior)}</span>}
        </div>
        <button
          disabled={outOfStock}
          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          className={`w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${outOfStock ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
        >
          <ShoppingCart size={18} /> {outOfStock ? "Agotado" : "Agregar"}
        </button>
      </div>
    </div>
  );
}