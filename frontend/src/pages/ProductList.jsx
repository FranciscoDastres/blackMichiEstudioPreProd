// ProductList.jsx - FUNCIONALIDAD COMPLETAMENTE ARREGLADA
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import useCart from "../hooks/useCart";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getImageUrl(imagePath) {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith('http')) return imagePath;

  const baseURL = api.defaults.baseURL?.replace('/api', '') || '';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const webpPath = cleanPath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

  return `${baseURL}${webpPath}`;
}

function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { addToCart, isStockExceeded } = useCart();

  const categoriaParam = searchParams.get("categoria");
  const busquedaParam = searchParams.get("busqueda");

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceLimit] = useState(100000);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ✅ Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar categorías
        const categoriesResponse = await api.get("/categorias");
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        setCategories(categoriesData);

        // Cargar todos los productos
        const allResponse = await api.get("/productos");
        const allData = Array.isArray(allResponse.data) ? allResponse.data : [];
        setAllProducts(allData);
        console.log(`✅ ${allData.length} productos cargados`);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        setError("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Procesar parámetros de URL
  useEffect(() => {
    if (categoriaParam) {
      const catId = parseInt(categoriaParam);
      setSelectedCategoryId(catId);

      // Encontrar el nombre de la categoría
      const foundCat = categories.find(c => c.id === catId);
      if (foundCat) {
        setSelectedCategoryName(foundCat.nombre);
      }
      setCurrentPage(1);
    } else {
      setSelectedCategoryId(null);
      setSelectedCategoryName("");
      setCurrentPage(1);
    }
  }, [categoriaParam, categories]);

  // ✅ Filtrado LOCAL
  const filteredProducts = allProducts
    .filter((product) => {
      // Búsqueda por término
      if (busquedaParam) {
        const searchLower = busquedaParam.toLowerCase();
        return (
          (product.titulo || "").toLowerCase().includes(searchLower) ||
          (product.descripcion || "").toLowerCase().includes(searchLower)
        );
      }

      // Filtrado por categoría
      if (selectedCategoryId) {
        return product.categoria_id === selectedCategoryId;
      }

      // Mostrar todos
      return true;
    })
    .filter((product) => {
      // Filtro de precio
      const price = Number(product.precio) || 0;
      return price >= minPrice;
    })
    .filter((product) => {
      // Filtro de rating
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
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleCategoryChange = (categoryId) => {
    setCurrentPage(1);
    if (categoryId === "") {
      navigate("/productos");
    } else {
      navigate(`/productos?categoria=${categoryId}`);
    }
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName("");
    setSortBy("newest");
    setCurrentPage(1);
    setMinPrice(0);
    setSelectedRating(0);
    navigate("/productos");
  };

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
        <div className="text-center">
          <div className="text-red-600 font-bold mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {busquedaParam
                ? `Resultados para "${busquedaParam}"`
                : selectedCategoryName
                  ? `Productos en ${selectedCategoryName}`
                  : "Todos los productos"}
            </h1>
            <p className="text-sm text-muted">
              {filteredProducts.length} producto
              {filteredProducts.length !== 1 && "s"} encontrado
              {filteredProducts.length !== 1 && "s"}.
            </p>
          </div>

          {/* Ordenar */}
          <div className="mt-4 md:mt-0">
            <label className="mr-2 text-sm text-muted">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="newest">Más recientes</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6">
          {/* Sidebar */}
          <aside className="bg-background rounded-2xl shadow-sm border border-border p-5 h-fit">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Filtrar por categoría
            </h2>

            <div className="space-y-2 mb-6">
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${!selectedCategoryId
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted/20"
                  }`}
              >
                Todas las categorías
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${selectedCategoryId === category.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted/20"
                    }`}
                >
                  {category.nombre || "Sin categoría"}
                </button>
              ))}
            </div>

            {/* Precio */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground mb-3">
                Filtrar por precio
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min={0}
                  max={maxPriceLimit}
                  step={500}
                  value={minPrice}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setMinPrice(Number(e.target.value));
                  }}
                  className="w-full accent-primary"
                />

                <div className="flex justify-between text-xs text-muted">
                  <span>
                    Desde:{" "}
                    <span className="font-semibold">
                      {CLP.format(minPrice)}
                    </span>
                  </span>
                  <span>
                    Hasta:{" "}
                    <span className="font-semibold">
                      {CLP.format(maxPriceLimit)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground mb-3">
                Filtrar por calificación
              </p>

              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    id={`rating-${rating}`}
                    name="rating"
                    checked={selectedRating === rating}
                    onChange={() => {
                      setCurrentPage(1);
                      setSelectedRating(rating);
                    }}
                    className="accent-primary"
                  />
                  <label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted fill-muted"
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.16 12 17.77 5.82 21.16 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </label>
                </div>
              ))}

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  id="rating-0"
                  name="rating"
                  checked={selectedRating === 0}
                  onChange={() => {
                    setCurrentPage(1);
                    setSelectedRating(0);
                  }}
                  className="accent-primary"
                />
                <label htmlFor="rating-0" className="text-xs text-muted">
                  Sin calificación
                </label>
              </div>
            </div>

            {(selectedCategoryId ||
              sortBy !== "newest" ||
              minPrice !== 0 ||
              selectedRating !== 0 ||
              busquedaParam) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 w-full text-xs font-semibold px-3 py-2 rounded-lg border border-border text-foreground hover:bg-muted/20"
                >
                  Limpiar filtros
                </button>
              )}
          </aside>

          {/* Contenido principal */}
          <main>
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 auto-rows-fr">
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
                        <div className="relative w-full h-56 bg-muted/20 overflow-hidden group">
                          <div className="w-full h-full relative">
                            <img
                              src={getImageUrl(primaryImage)}
                              alt={product.titulo || "Producto"}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg";
                              }}
                            />

                            {additionalImages.length > 0 && (
                              <img
                                src={getImageUrl(additionalImages[0])}
                                alt={`${product.titulo} (vista alternativa)`}
                                className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg";
                                }}
                              />
                            )}
                          </div>

                          {product.descuento && (
                            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                              -{product.descuento}%
                            </span>
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2">
                            {product.titulo || "Producto"}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-4 h-4 ${i < avgRating ? "text-yellow-500 fill-yellow-500" : "text-muted fill-muted"
                                  }`}
                                viewBox="0 0 24 24"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.16 12 17.77 5.82 21.16 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                            <span className="text-[11px] text-muted ml-1">
                              {product.total_valoraciones
                                ? `(${product.total_valoraciones} calif.)`
                                : "(Sin calificación)"}
                            </span>
                          </div>

                          {/* Precios */}
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-lg font-bold text-primary">
                              {CLP.format(product.precio || 0)}
                            </span>
                            {product.precio_anterior && (
                              <span className="line-through text-muted text-xs">
                                {CLP.format(product.precio_anterior)}
                              </span>
                            )}
                          </div>

                          {/* Botón */}
                          <button
                            className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 mt-auto ${outOfStock
                              ? "bg-muted text-muted cursor-not-allowed"
                              : "border border-primary text-primary hover:bg-primary/10"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!outOfStock) addToCart(product);
                            }}
                            disabled={outOfStock}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 3h1.384c1.45 0 2.3 1.68 1.25 2.95C6.5 8.04 9.5 10.5 12 10.5c2.5 0 5.5-2.46 7.25-4.5C20.5 4.68 21.35 3 22.75 3H24m-10 3v6m0 0l-3-3m3 3 3-3m-3 3v6"
                              />
                            </svg>
                            {outOfStock ? "Sin stock" : "Agregar al carrito"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-4">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full border border-border bg-background hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-sm"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 py-1 rounded-lg border text-xs font-medium ${currentPage === page
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border bg-background hover:bg-muted/20"
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full border border-border bg-background hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-sm"
                      aria-label="Siguiente página"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted text-lg mb-4">
                  No se encontraron productos que coincidan con los filtros.
                </div>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                >
                  Limpiar filtros
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
