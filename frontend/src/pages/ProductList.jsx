import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import useCart from "../hooks/useCart";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LazyImage from "../components/LazyImage/LazyImage";
import { getImageUrl } from "../utils/getImageUrl";

function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceLimit] = useState(100000);
  const [selectedRating, setSelectedRating] = useState(0);

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