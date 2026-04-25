import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import api from "../services/api";
import useCart from "../hooks/useCart";
import useSEO from "../hooks/useSEO";
import ProductFilters from "../components/ProductList/ProductFilters";
import ProductCard from "../components/ProductList/ProductCard";
import Pagination from "../components/ProductList/Pagination";
import { ProductListSkeleton } from "../components/Skeletons/Skeletons";

interface ListProduct {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  imagen_principal?: string;
  categoria_id?: number;
  created_at?: string;
  promedio_calificacion?: string | number;
}

function ProductList() {
  const seo = useSEO({
    title: "Productos",
    description:
      "Explora toda la colección de figuras impresas en 3D de Black Michi Estudio. Cultura pop, anime, ciencia ficción y más.",
    path: "/productos",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState<ListProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState(
    searchParams.get("orden") || "newest"
  );
  const [maxPrice, setMaxPrice] = useState(200000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [selectedRating, setSelectedRating] = useState(
    Number(searchParams.get("rating")) || 0
  );

  const { addToCart, isStockExceeded } = useCart();

  const categoriaParam = searchParams.get("categoria");
  const busquedaParam = searchParams.get("busqueda");

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

        const allData: ListProduct[] = Array.isArray(allResponse.data) ? allResponse.data : [];
        setAllProducts(allData);

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
      setSelectedCategoryId(parseInt(categoriaParam));
    } else {
      setSelectedCategoryId(null);
    }
    setCurrentPage(1);
  }, [categoriaParam]);

  const handleCategoryToggle = (cat: { id: number; nombre: string }) => {
    if (selectedCategoryId === cat.id) {
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
      const busqueda = prev.get("busqueda");
      if (busqueda) next.set("busqueda", busqueda);
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
          ? Math.round(parseFloat(String(product.promedio_calificacion)))
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
            return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        }
      });
  }, [
    allProducts,
    busquedaParam,
    selectedCategoryId,
    priceRange,
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

  if (loading) return <ProductListSkeleton count={productsPerPage} />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  const filtersProps = {
    categories,
    selectedCategoryId,
    onCategoryToggle: handleCategoryToggle,
    priceRange,
    setPriceRange,
    maxPrice,
    selectedRating,
    setSelectedRating,
    hasActiveFilters,
    onClearFilters: clearFilters,
  };

  return (
    <>{seo}<div className="min-h-screen bg-background">
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
              <ProductFilters {...filtersProps} />
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ProductFilters {...filtersProps} />
          </aside>

          {/* Contenido */}
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
                  <strong className="text-foreground">
                    {filteredProducts.length}
                  </strong>{" "}
                  producto{filteredProducts.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted whitespace-nowrap">
                  Ordenar por
                </label>
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
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    outOfStock={isStockExceeded(product)}
                    onClick={(p) => navigate(`/producto/${p.id}`)}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div></>
  );
}

export default ProductList;
