import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import useCart from "../hooks/useCart";
import { ChevronLeft, ChevronRight, X, SlidersHorizontal } from "lucide-react";
import LazyImage from "../components/LazyImage/LazyImage";
import { getImageUrl } from "../utils/getImageUrl";

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [sortBy, setSortBy] = useState(searchParams.get("orden") || "newest");

  const [minPrice, setMinPrice] = useState(Number(searchParams.get("precioMin")) || 0);
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

        const categoriesResponse = await api.get("/categorias");
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        setCategories(categoriesData);

        const allResponse = await api.get("/productos");
        const allData = Array.isArray(allResponse.data) ? allResponse.data : [];
        setAllProducts(allData);
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

  const updateFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!value || value === '0' || value === 'newest') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams();
      if (prev.get('busqueda')) next.set('busqueda', prev.get('busqueda'));
      if (prev.get('categoria')) next.set('categoria', prev.get('categoria'));
      return next;
    });
    setSortBy('newest');
    setMinPrice(0);
    setSelectedRating(0);
    setCurrentPage(1);
  };

  const hasActiveFilters = sortBy !== 'newest' || minPrice > 0 || selectedRating > 0;

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
        return price >= minPrice;
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
  }, [
    allProducts,
    busquedaParam,
    selectedCategoryId,
    minPrice,
    selectedRating,
    sortBy,
  ]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 font-bold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Chips activos */}
          {busquedaParam && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
              <span>Búsqueda: "{busquedaParam}"</span>
              <button
                aria-label="Quitar búsqueda"
                onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('busqueda'); return n; })}
                className="hover:text-primary/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {selectedCategoryName && (
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm">
              <span>{selectedCategoryName}</span>
              <button
                aria-label="Quitar categoría"
                onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('categoria'); return n; })}
                className="hover:text-primary/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Controles de filtrado */}
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {/* Precio mínimo */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted whitespace-nowrap">Desde $</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={minPrice || ''}
                onChange={e => {
                  const v = Number(e.target.value) || 0;
                  setMinPrice(v);
                  updateFilter('precioMin', v || '0');
                }}
                placeholder="0"
                className="w-24 text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {/* Ordenar */}
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); updateFilter('orden', e.target.value); }}
              className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
            >
              <option value="newest">Más recientes</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="name">Nombre A–Z</option>
            </select>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Limpiar
              </button>
            )}

            <span className="text-sm text-muted">{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {currentProducts.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-lg mb-2">No se encontraron productos</p>
            <button onClick={clearFilters} className="text-primary hover:underline text-sm">
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                <div className="relative w-full h-56 bg-muted/20 overflow-hidden">

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
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < avgRating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted fill-muted"
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.16 12 17.77 5.82 21.16 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>

                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-lg font-bold text-primary">
                      {CLP.format(product.precio || 0)}
                    </span>
                  </div>

                  <button
                    className={`w-full py-2 rounded-xl font-semibold text-sm mt-auto ${outOfStock
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

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
            >
              <ChevronLeft />
            </button>

            <span>{currentPage}</span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;