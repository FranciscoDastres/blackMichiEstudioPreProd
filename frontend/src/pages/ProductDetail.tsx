// ProductDetail.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RelatedProducts from "../components/RelatedProducts/RelatedProducts";
import ProductGallery from "../components/ProductDetail/ProductGallery";
import ProductInfo from "../components/ProductDetail/ProductInfo";
import ProductTabs from "../components/ProductDetail/ProductTabs";
import { ProductDetailSkeleton } from "../components/Skeletons/Skeletons";
import api from "../services/api";
import useCart from "../hooks/useCart";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl } from "../utils/getImageUrl";
import useSEO from "../hooks/useSEO";
import type { Review, ReviewAction } from "../types/review";

interface ApiProduct {
  id: number;
  titulo: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_principal?: string;
  imagenes_adicionales?: string[];
  categoria_id?: number;
  categoria_nombre?: string;
}


export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { addToCart, isStockExceeded } = useCart();
  const { user, isAuthenticated: isLoggedIn } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);

        const productResponse = await api.get(`/productos/${productId}`);
        const productData = productResponse.data;
        setProduct(productData);

        try {
          setLoadingReviews(true);
          const reviewsResponse = await api.get(
            `/reviews?producto_id=${productId}`
          );
          setReviews(
            Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []
          );
        } catch (reviewError) {
          console.error("Error cargando reseñas:", reviewError);
          setReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      } catch (err: any) {
        console.error("Error cargando producto:", err);
        setError(err.message || "Error al cargar producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [productId]);

  const images = useMemo(() => {
    if (!product) return [];
    const raw: string[] = [];
    if (product.imagen_principal) raw.push(product.imagen_principal);
    if (Array.isArray(product.imagenes_adicionales)) {
      raw.push(...product.imagenes_adicionales);
    }
    return raw.map((img) => getImageUrl(img)).filter(Boolean) as string[];
  }, [product]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, r) => sum + (r.calificacion || 0), 0) /
      reviews.length
    );
  }, [reviews]);

  // Handler para ReviewForm: add/remove/replace reseñas
  const handleReviewChange = (payload: Review | Review[], action: ReviewAction) => {
    if (action === "add") {
      setReviews((prev) => [payload as Review, ...prev]);
    } else if (action === "remove") {
      setReviews((prev) => prev.filter((r) => r.id !== (payload as Review).id));
    } else if (action === "replace") {
      setReviews(payload as Review[]);
    }
  };

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.titulo,
        description:
          product.descripcion ||
          `${product.titulo} — Impresión 3D personalizada`,
        image: product.imagen_principal
          ? [getImageUrl(product.imagen_principal)]
          : undefined,
        brand: { "@type": "Brand", name: "Black Michi Estudio" },
        offers: {
          "@type": "Offer",
          price: product.precio,
          priceCurrency: "CLP",
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `https://blackmichiestudio.cl/producto/${product.id}`,
        },
        ...(reviews.length > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }),
      }
    : undefined;

  const seo = useSEO({
    title: product?.titulo,
    description:
      product?.descripcion ||
      (product ? `${product.titulo} — Impresión 3D personalizada` : undefined),
    path: `/producto/${productId}`,
    image: product?.imagen_principal
      ? getImageUrl(product.imagen_principal)
      : undefined,
    type: "product",
    jsonLd: productJsonLd,
  });

  if (loading) return <ProductDetailSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4 text-rose-400">❌</div>
          <div className="text-xl font-bold text-foreground mb-4">
            Error: {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-add-cart"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4 text-muted">🔍</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Producto no encontrado
          </h2>
          <Link to="/" className="btn-add-cart">
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>{seo}<div className="min-h-screen py-12 px-4">
      {/* Decoración */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Botón volver */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a productos</span>
          </Link>
        </div>

        {/* Galería + Info */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-border shadow-2xl mb-8">
          <div className="p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <ProductGallery
                images={images}
                titulo={product.titulo}
              />
              <ProductInfo
                product={product}
                reviews={reviews}
                avgRating={avgRating}
                onReviewsClick={() => setActiveTab("reviews")}
                addToCart={addToCart}
                isStockExceeded={isStockExceeded}
              />
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <ProductTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          product={product}
          reviews={reviews}
          loadingReviews={loadingReviews}
          isLoggedIn={isLoggedIn}
          currentUser={user}
          productId={Number(productId)}
          onNewReview={handleReviewChange}
        />

        {/* Relacionados */}
        {product.categoria_id && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Productos relacionados
              </h2>
              <Link
                to={`/categoria/${product.categoria_nombre}`}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="min-h-[400px]">
              <RelatedProducts
                categoriaId={product.categoria_id}
                currentProductId={product.id}
              />
            </div>
          </div>
        )}
      </div>
    </div></>
  );
}
