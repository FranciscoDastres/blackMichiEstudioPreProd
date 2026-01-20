import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import useCart from "../hooks/useCart";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Trash2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados de datos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros locales
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  const { addToCart, isStockExceeded } = useCart();

  // Parámetros de URL
  const categoriaParam = searchParams.get("categoria");
  const busquedaParam = searchParams.get("busqueda");

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const maxPriceLimit = 100000;

  // 1. Cargar Categorías una sola vez
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await ApiService.getCategorias();
        setCategories(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    loadCategories();
  }, []);

  // 2. Cargar Productos cuando cambie la URL (Búsqueda o Categoría)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let data;

        if (busquedaParam) {
          data = await ApiService.buscarProductos(busquedaParam);
        } else if (categoriaParam) {
          data = await ApiService.getProductosPorCategoria(categoriaParam);
        } else {
          data = await ApiService.getProductos();
        }
        setProducts(data);
        setCurrentPage(1); // Resetear página al cambiar fuente de datos
      } catch (err) {
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoriaParam, busquedaParam]);

  // 3. Lógica de Filtrado y Ordenamiento (useMemo para rendimiento)
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const price = Number(product.precio) || 0;
        const rating = product.rating || 0;
        return price >= minPrice && rating >= selectedRating;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low": return a.precio - b.precio;
          case "price-high": return b.precio - a.precio;
          case "name": return a.titulo.localeCompare(b.titulo);
          default: return new Date(b.created_at) - new Date(a.created_at);
        }
      });
  }, [products, minPrice, selectedRating, sortBy]);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handlers
  const handleCategoryChange = (categoryNombre) => {
    if (!categoryNombre) {
      navigate("/productos");
    } else {
      navigate(`/productos?categoria=${encodeURIComponent(categoryNombre)}`);
    }
  };

  const clearFilters = () => {
    setSortBy("newest");
    setMinPrice(0);
    setSelectedRating(0);
    setCurrentPage(1);
    navigate("/productos");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header de Resultados */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {busquedaParam ? `Resultados para "${busquedaParam}"` :
                categoriaParam ? `Categoría: ${categoriaParam}` : "Nuestra Colección"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 && "s"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="newest">Más recientes</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="name">Nombre: A-Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">

          {/* Sidebar de Filtros */}
          <aside className="space-y-8">
            {/* Categorías */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold mb-4 flex items-center gap-2">Categorías</h2>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!categoriaParam ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
                >
                  Todas las categorías
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.nombre)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${categoriaParam === cat.nombre ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold mb-4">Rango de Precio</h2>
              <input
                type="range"
                min={0}
                max={maxPriceLimit}
                step={1000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground">
                <span>Min: {CLP.format(minPrice)}</span>
                <span>Max: {CLP.format(maxPriceLimit)}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold mb-4">Calificación mínima</h2>
              <div className="space-y-2">
                {[5, 4, 3, 2].map((star) => (
                  <label key={star} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === star}
                      onChange={() => setSelectedRating(star)}
                      className="w-4 h-4 accent-primary"
                    />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < star ? "fill-yellow-400 text-yellow-400" : "text-muted"} />
                      ))}
                      <span className="text-xs ml-1 text-muted-foreground">o más</span>
                    </div>
                  </label>
                ))}
                <button
                  onClick={() => setSelectedRating(0)}
                  className="text-xs text-primary hover:underline mt-2"
                >
                  Mostrar todas
                </button>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} /> Limpiar Filtros
            </button>
          </aside>

          {/* Grid de Productos */}
          <main>
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentProducts.map((product) => {
                    const outOfStock = isStockExceeded(product);
                    const imgUrl = product.imagen_principal
                      ? `${API_BASE_URL}${product.imagen_principal.startsWith("/") ? "" : "/"}${product.imagen_principal.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`
                      : "/placeholder.svg";

                    return (
                      <div
                        key={product.id}
                        className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        {/* Contenedor Imagen */}
                        <div
                          className="relative h-64 overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/producto/${product.id}`)}
                        >
                          <img
                            src={imgUrl}
                            alt={product.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => (e.target.src = "/placeholder.svg")}
                          />
                          {product.descuento > 0 && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              -{product.descuento}%
                            </div>
                          )}
                        </div>

                        {/* Información */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                              {product.categoria_nombre || "General"}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{product.rating || "N/A"}</span>
                            </div>
                          </div>

                          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {product.titulo}
                          </h3>

                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-xl font-black text-primary">
                              {CLP.format(product.precio)}
                            </span>
                            {product.precio_anterior && (
                              <span className="text-sm line-through text-muted-foreground">
                                {CLP.format(product.precio_anterior)}
                              </span>
                            )}
                          </div>

                          <button
                            disabled={outOfStock}
                            onClick={() => addToCart(product)}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${outOfStock
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                              }`}
                          >
                            <ShoppingCart size={18} />
                            {outOfStock ? "Agotado" : "Añadir al carrito"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronLeft />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg border font-medium transition-colors ${currentPage === i + 1 ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground text-lg mb-6">No hay productos que coincidan con tu búsqueda</p>
                <button onClick={clearFilters} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold">
                  Ver todos los productos
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;