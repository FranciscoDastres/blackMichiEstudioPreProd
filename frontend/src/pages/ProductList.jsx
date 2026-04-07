import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import useCart from "../hooks/useCart";
import useSEO from "../hooks/useSEO";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import LazyImage from "../components/LazyImage/LazyImage";
import { ProductListSkeleton } from "../components/Skeletons/Skeletons";
import { getImageUrl } from "../utils/getImageUrl";

const StarIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? "text-yellow-400 fill-yellow-400" : "text-muted fill-muted"}`}
    viewBox="0 0 24 24"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.16 12 17.77 5.82 21.16 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

function ProductList() {
  useSEO({
    title: "Productos",
    description: "Explora toda la colección de figuras impresas en 3D de Black Michi Estudio. Cultura pop, anime, ciencia ficción y más.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Sidebar open state (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Sections collapse state
  const [catOpen, setCatOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [, setSelectedCategoryName] = useState("");
  const [sortBy, setSortBy] = useState(searchParams.get("orden") || "newest");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedRating, setSelectedRating] = useState(Number(searchParams.get("rating")) || 0);

  const { addToCart, isStockExceeded } = useCart();

  const categoriaParam = searchParams.get("categoria");
  const busquedaParam = searchParams.get("busqueda");

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesResponse, allResponse] = await Promise.all([
          api.get("/categorias"),
          api.get("/productos"),
        ]);

        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        setCategories(categoriesData);

        const allData = Array.isArray(allResponse.data) ? allResponse.data : [];
        setAllProducts(allData);

        // Calcular precio máximo real para el slider
        if (allData.length > 0) {
          const max = Math.max(...allData.map((p) => Number(p.precio) || 0));
          const rounded = Math.ceil(max / 10000) * 10000 || 200000;
          setMaxPrice(rounded);
          setPriceRange([0, rounded]);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (categoriaParam) {
      const catId = parseInt(categoriaParam);
      setSelectedCategoryId(catId);
      const foundCat = categories.find((c) => c.id === catId);
      if (foundCat) setSelectedCategoryName(foundCat.nombre);
      setCurrentPage(1);
    } else {
      setSelectedCategoryId(null);
      setSelectedCategoryName("");
      setCurrentPage(1);
    }
  }, [categoriaParam, categories]);

  const handleCategoryToggle = (cat) => {
    if (selectedCategoryId === cat.id) {
      // Deseleccionar
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("categoria");
        return next;
      });
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("categoria", String(cat.id));
        return next;
      });
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get("busqueda")) next.set("busqueda", prev.get("busqueda"));
      return next;
    });
    setSortBy("newest");
    setPriceRange([0, maxPrice]);
    setSelectedRating(0);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    sortBy !== "newest" ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    selectedRating > 0 ||
    !!selectedCategoryId;

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        if (busquedaParam) {
          const searchLower = busquedaParam.toLowerCase();
          return (
            (product.titulo || "").toLowerCase().includes(searchLower) ||
            (product.descripcion || "").toLowerCase().includes(searchLower)
          );
        }
        if (selectedCategoryId) {
          return product.categoria_id === selectedCategoryId;
        }
        return true;
      })
      .filter((product) => {
        const price = Number(product.precio) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      })
      .filter((product) => {
        if (selectedRating === 0) return true;
        const rating = product.promedio_calificacion
          ? Math.round(parseFloat(product.promedio_calificacion))
          : 0;
        return rating >= selectedRating;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return (a.precio || 0) - (b.precio || 0);
          case "price-high":
            return (b.precio || 0) - (a.precio || 0);
          case "name":
            return (a.titulo || "").localeCompare(b.titulo || "");
          default:
            return new Date(b.created_at) - new Date(a.created_at);
        }
      });
  }, [allProducts, busquedaParam, selectedCategoryId, priceRange, selectedRating, sortBy]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return <ProductListSkeleton count={productsPerPage} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="space-y-6">

      {/* Comprar por Categoría */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-background font-semibold text-foreground text-sm"
          onClick={() => setCatOpen((o) => !o)}
        >
          <span>Comprar por Categoría</span>
          {catOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {catOpen && (
          <div className="px-4 pb-4 pt-2 space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryId === cat.id}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat.nombre}
                </span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-muted">Sin categorías</p>
            )}
          </div>
        )}
      </div>

      {/* Filtrar por Precio */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-background font-semibold text-foreground text-sm"
          onClick={() => setPriceOpen((o) => !o)}
        >
          <span>Filtrar por Precio</span>
          {priceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {priceOpen && (
          <div className="px-4 pb-4 pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{CLP.format(priceRange[0])}</span>
              <span>{CLP.format(priceRange[1])}</span>
            </div>

            {/* Slider min */}
            <div className="relative">
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={1000}
                value={priceRange[0]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]);
                }}
                className="w-full h-1.5 appearance-none rounded-full bg-border cursor-pointer accent-primary"
              />
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={1000}
                value={priceRange[1]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
                }}
                className="w-full h-1.5 appearance-none rounded-full bg-border cursor-pointer accent-primary mt-2"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Mín</label>
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  step={1000}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const v = Math.min(Number(e.target.value), priceRange[1]);
                    setPriceRange([v, priceRange[1]]);
                  }}
                  className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted block mb-1">Máx</label>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={maxPrice}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const v = Math.max(Number(e.target.value), priceRange[0]);
                    setPriceRange([priceRange[0], v]);
                  }}
                  className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtrar por Calificación */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-background font-semibold text-foreground text-sm"
          onClick={() => setRatingOpen((o) => !o)}
        >
          <span>Filtrar por Calificación</span>
          {ratingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {ratingOpen && (
          <div className="px-4 pb-4 pt-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label key={stars} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedRating === stars}
                  onChange={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < stars} />
                  ))}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 text-sm text-muted hover:text-primary border border-border rounded-xl py-2 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Botón sidebar móvil */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:border-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block" />
            )}
          </button>

          {busquedaParam && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
              <span>"{busquedaParam}"</span>
              <button
                onClick={() =>
                  setSearchParams((prev) => {
                    const n = new URLSearchParams(prev);
                    n.delete("busqueda");
                    return n;
                  })
                }
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar móvil overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-background overflow-y-auto p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-foreground">Filtros</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <SidebarContent />
          </aside>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">

            {/* Barra superior */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 bg-background border border-border rounded-xl">
              <div className="flex items-center gap-2 flex-wrap">
                {busquedaParam && (
                  <div className="hidden lg:flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    <span>"{busquedaParam}"</span>
                    <button
                      onClick={() =>
                        setSearchParams((prev) => {
                          const n = new URLSearchParams(prev);
                          n.delete("busqueda");
                          return n;
                        })
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <span className="text-sm text-muted">
                  Hay{" "}
                  <strong className="text-foreground">{filteredProducts.length}</strong>{" "}
                  producto{filteredProducts.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted whitespace-nowrap">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      if (e.target.value === "newest") next.delete("orden");
                      else next.set("orden", e.target.value);
                      return next;
                    });
                  }}
                  className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="newest">Más recientes</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="name">Nombre A–Z</option>
                </select>
              </div>
            </div>

            {currentProducts.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <p className="text-lg mb-2">No se encontraron productos</p>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline text-sm"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                {currentProducts.map((product) => {
                  const outOfStock = isStockExceeded(product);
                  const primaryImage = product.imagen_principal;
                  const additionalImages = product.imagenes_adicionales || [];
                  const avgRating = product.promedio_calificacion
                    ? Math.round(parseFloat(product.promedio_calificacion))
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className="group bg-background rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 flex flex-col"
                      onClick={() => navigate(`/producto/${product.id}`)}
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
                            if (!outOfStock) addToCart(product);
                          }}
                          disabled={outOfStock}
                        >
                          {outOfStock ? "Sin stock" : "Agregar al carrito"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:border-primary disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                          page === currentPage
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary text-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (Math.abs(page - currentPage) === 2) {
                    return (
                      <span key={page} className="text-muted text-sm">
                        …
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border hover:border-primary disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
