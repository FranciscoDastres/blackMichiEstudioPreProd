// ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import RelatedProducts from "../components/RelatedProducts/RelatedProducts";
import api from "../services/api";
import useCart from "../hooks/useCart";
import {
  Star,
  ShoppingBag,
  Truck,
  Shield,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Sparkles,
  Package,
  User,
  MessageSquare,
} from "lucide-react";

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = localStorage.getItem("user");
      setUser(userData ? JSON.parse(userData) : { id: "unknown" });
    }
    setLoading(false);
  }, []);

  return { user, loading, isLoggedIn: !!localStorage.getItem("token") };
}

// ✅ Función segura para convertir imágenes a webp
function getImageUrl(imagePath) {
  if (!imagePath) return "/placeholder.svg";

  // Si es URL completa, devolverla
  if (imagePath.startsWith('http')) return imagePath;

  const baseURL = api.defaults.baseURL?.replace('/api', '') || '';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const webpPath = cleanPath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

  return `${baseURL}${webpPath}`;
}

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isStockExceeded } = useCart();

  const [activeTab, setActiveTab] = useState("description");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  // ✅ Estado para reseñas
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { user, loading: authLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch producto
        const productResponse = await api.get(`/productos/${productId}`);
        const productData = productResponse.data;
        setProduct(productData);
        setSelectedImgIndex(0);
        setQuantity(1);

        // ✅ Fetch reseñas de forma segura
        try {
          setLoadingReviews(true);
          const reviewsResponse = await api.get(`/reviews?producto_id=${productId}`);
          const reviewsData = Array.isArray(reviewsResponse.data)
            ? reviewsResponse.data
            : [];
          setReviews(reviewsData);
        } catch (reviewError) {
          console.error("❌ Error cargando reseñas:", reviewError);
          setReviews([]);
        } finally {
          setLoadingReviews(false);
        }
      } catch (err) {
        console.error("❌ Error cargando producto:", err);
        setError(err.message || "Error al cargar producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [productId]);

  const handleReviewSubmit = async () => {
    if (rating === 0 || !reviewText.trim()) {
      setSubmitError("Por favor, completa todos los campos.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // ✅ Enviar reseña
      await api.post("/reviews", {
        producto_id: productId,
        usuario_id: user?.id || "unknown",
        calificacion: rating,
        comentario: reviewText.trim(),
      });

      // ✅ Recargar reseñas
      try {
        const updatedReviews = await api.get(`/reviews?producto_id=${productId}`);
        setReviews(Array.isArray(updatedReviews.data) ? updatedReviews.data : []);
      } catch (err) {
        console.error("Error recargando reseñas:", err);
      }

      setReviewText("");
      setRating(0);
      alert("¡Gracias por tu reseña!");
    } catch (error) {
      console.error("❌ Error al enviar reseña:", error);
      setSubmitError(
        error.message || "Hubo un problema al enviar tu reseña. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-primary mx-auto mb-6"></div>
          </div>
          <p className="text-lg text-muted font-light animate-pulse">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4 text-rose-400">❌</div>
          <div className="text-xl font-display font-extrabold text-foreground mb-4">Error: {error}</div>
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
          <h2 className="text-2xl font-display font-extrabold text-foreground mb-4">Producto no encontrado</h2>
          <Link
            to="/"
            className="btn-add-cart"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Construir array de imágenes de forma segura
  const rawImages = [];
  if (product.imagen_principal) {
    rawImages.push(product.imagen_principal);
  }
  if (product.imagenes_adicionales && Array.isArray(product.imagenes_adicionales)) {
    rawImages.push(...product.imagenes_adicionales);
  }

  const images = rawImages.map(img => getImageUrl(img)).filter(Boolean);
  const mainImage = images[selectedImgIndex] || "/placeholder.svg";

  const CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const stock = product.stock ?? 99;
  const maxQty = Math.max(1, stock);

  const handleImageZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  // ✅ Calcular promedio de reseñas de forma segura
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.calificacion || 0), 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Elementos decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Botón de retroceso */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a productos</span>
          </Link>
        </div>

        {/* Contenedor principal */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-border shadow-2xl mb-8">
          <div className="p-6 md:p-8">
            {/* Contenido: Imagen + Detalles */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Galería de imágenes */}
              <div className="space-y-4">
                {/* Imagen principal */}
                <div
                  className="relative overflow-hidden rounded-xl bg-secondary/30 aspect-square group"
                  onMouseMove={handleImageZoom}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  <img
                    src={mainImage}
                    alt={product.titulo || "Producto"}
                    width="800"
                    height="800"
                    loading="eager"
                    className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`}
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                  {isZoomed && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/10"></div>
                  )}
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImgIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImgIndex === index
                          ? "border-primary shadow-lg shadow-primary/20 scale-105"
                          : "border-border hover:border-muted/50"
                          }`}
                        aria-label={`Ver imagen ${index + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${product.titulo} ${index + 1}`}
                          width="160"
                          height="160"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Navegación de imágenes */}
                {images.length > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setSelectedImgIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="p-2 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <span className="text-sm text-muted">
                      {selectedImgIndex + 1} / {images.length}
                    </span>
                    <button
                      onClick={() => setSelectedImgIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="p-2 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Detalles del producto */}
              <div className="space-y-6">
                {/* Categoría */}
                {product.categoria_nombre && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{product.categoria_nombre}</span>
                  </div>
                )}

                {/* Título */}
                <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground leading-tight">
                  {product.titulo || "Producto"}
                </h1>

                {/* Calificación */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 fill-current ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-muted/30'}`}
                        />
                      ))}
                    </div>
                    {reviews.length > 0 ? (
                      <span className="text-sm text-muted">
                        {avgRating.toFixed(1)} ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})
                      </span>
                    ) : (
                      <span className="text-sm text-muted">Sin reseñas</span>
                    )}
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <span className={`text-sm font-medium ${stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stock > 0 ? "✓ En stock" : "✗ Agotado"}
                  </span>
                </div>

                {/* Descripción */}
                {product.descripcion && (
                  <p className="text-muted leading-relaxed">
                    {product.descripcion}
                  </p>
                )}

                {/* Precios */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="price-text text-4xl">{CLP.format(product.precio || 0)}</span>
                    {product.precio_anterior && (
                      <span className="line-through text-muted">{CLP.format(product.precio_anterior)}</span>
                    )}
                  </div>
                  {product.descuento && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
                      <span className="text-sm font-bold text-emerald-400">
                        {product.descuento}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Beneficios */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <Truck className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">Envío en 3-5 días</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">Garantía 30 días</span>
                  </div>
                </div>

                {/* Cantidad y botón */}
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Cantidad</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-xl bg-secondary/30 h-12">
                        <button
                          aria-label="Restar cantidad"
                          className="h-full w-12 flex items-center justify-center text-foreground rounded-l-xl hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                          disabled={quantity === 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-base font-semibold text-foreground">{quantity}</span>
                        <button
                          aria-label="Sumar cantidad"
                          className="h-full w-12 flex items-center justify-center text-foreground rounded-r-xl hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          onClick={() => setQuantity((q) => Math.min(q + 1, maxQty))}
                          disabled={quantity === maxQty}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-muted">
                        <span className="text-emerald-400">{stock} disponibles</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`btn-add-cart w-full !px-6 !py-4 !text-lg group relative overflow-hidden ${isStockExceeded(product) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    onClick={() => {
                      if (!isStockExceeded(product)) {
                        for (let i = 0; i < quantity; i++) {
                          addToCart({
                            id: product.id,
                            titulo: product.titulo,
                            precio: product.precio,
                            imagen: getImageUrl(product.imagen_principal),
                            stock: product.stock,
                          });
                        }
                        const btn = document.activeElement;
                        btn?.classList.add('bg-emerald-500');
                        setTimeout(() => {
                          btn?.classList.remove('bg-emerald-500');
                        }, 300);
                      }
                    }}
                    disabled={isStockExceeded(product)}
                  >
                    {isStockExceeded(product) ? (
                      "Sin stock disponible"
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Agregar al carrito
                      </>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted mb-2">
                    <Check className="w-4 h-4" />
                    <span>Impuesto incluido · Envío calculado al checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-border mb-8">
          {/* Navegación */}
          <div className="border-b border-border">
            <nav className="flex space-x-1 px-6" role="tablist">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 px-6 font-display font-bold text-sm border-b-2 transition-all ${activeTab === "description"
                  ? "text-primary border-primary"
                  : "text-muted border-transparent hover:text-foreground"
                  }`}
                role="tab"
              >
                Descripción
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`py-4 px-6 font-display font-bold text-sm border-b-2 transition-all ${activeTab === "specs"
                  ? "text-primary border-primary"
                  : "text-muted border-transparent hover:text-foreground"
                  }`}
                role="tab"
              >
                Especificaciones
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-6 font-display font-bold text-sm border-b-2 transition-all ${activeTab === "reviews"
                  ? "text-primary border-primary"
                  : "text-muted border-transparent hover:text-foreground"
                  }`}
                role="tab"
              >
                Reseñas
              </button>
            </nav>
          </div>

          {/* Contenido */}
          <div className="p-6 md:p-8">
            {activeTab === "description" && (
              <div className="space-y-6">
                <h3 className="text-xl font-display font-extrabold text-foreground">Descripción del Producto</h3>
                <div className="prose prose-invert max-w-none text-muted leading-relaxed">
                  {product.descripcion_larga || product.descripcion ||
                    "Producto personalizado impreso en 3D, ideal para regalos únicos y decoraciones especiales."}
                </div>

                {/* Características */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">Impresión 3D de alta calidad</h4>
                      <p className="text-sm text-muted mt-1">Detalles precisos y acabado profesional</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">Material duradero</h4>
                      <p className="text-sm text-muted mt-1">Resistente y de larga duración</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-6">
                <h3 className="text-xl font-display font-extrabold text-foreground">Especificaciones Técnicas</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <p className="text-sm text-muted">Material</p>
                      <p className="font-semibold text-foreground">PLA Premium</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <p className="text-sm text-muted">Tiempo de impresión</p>
                      <p className="font-semibold text-foreground">6-8 horas</p>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <p className="text-sm text-muted">Dimensiones aproximadas</p>
                    <p className="font-semibold text-foreground">10cm x 10cm x 10cm</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Encabezado */}
                <div>
                  <h3 className="text-xl font-display font-extrabold text-foreground mb-4">Reseñas de clientes</h3>

                  {loadingReviews ? (
                    <p className="text-muted">Cargando reseñas...</p>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="glass-panel p-5 rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {review.usuario_nombre || "Anónimo"}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < (review.calificacion || 0) ? 'text-yellow-400 fill-current' : 'text-muted'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted">
                              {review.created_at
                                ? new Date(review.created_at).toLocaleDateString("es-CL")
                                : "Fecha desconocida"
                              }
                            </span>
                          </div>
                          <p className="text-muted">{review.comentario || ""}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isLoggedIn ? (
                      <div className="glass-panel p-4 rounded-xl">
                        <p className="text-sm text-primary">
                          Por favor, <Link to="/login" className="font-bold underline">inicia sesión</Link> para ver y dejar reseñas.
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">No hay reseñas aún. ¡Sé el primero en dejar una!</p>
                    )
                  )}
                </div>

                {/* Formulario */}
                {isLoggedIn && (
                  <div className="glass-panel p-6 rounded-xl border border-border">
                    <h4 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Escribe tu reseña
                    </h4>

                    <form onSubmit={(e) => { e.preventDefault(); handleReviewSubmit(); }} className="space-y-6">
                      {/* Calificación */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground">Tu calificación</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-muted/30"
                                }`}
                              aria-label={`Calificar con ${star} estrellas`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        {rating === 0 && (
                          <p className="text-sm text-rose-400">Por favor, selecciona una calificación</p>
                        )}
                      </div>

                      {/* Texto */}
                      <div className="space-y-3">
                        <label htmlFor="review-text" className="block text-sm font-medium text-foreground">
                          Tu opinión
                        </label>
                        <textarea
                          id="review-text"
                          rows={4}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="glass-panel w-full px-4 py-3 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                          placeholder="¿Qué te pareció este producto? Comparte tu experiencia..."
                        />
                        {reviewText.trim().length === 0 && (
                          <p className="text-sm text-rose-400">Por favor, escribe tu reseña</p>
                        )}
                      </div>

                      {/* Error */}
                      {submitError && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
                          {submitError}
                        </div>
                      )}

                      {/* Botón */}
                      <button
                        type="submit"
                        disabled={isSubmitting || rating === 0 || reviewText.trim().length === 0}
                        className={`btn-add-cart !px-8 !py-3 ${isSubmitting || rating === 0 || reviewText.trim().length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <User className="w-5 h-5" />
                            Publicar reseña
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Productos relacionados */}
        {product.categoria_nombre && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-extrabold text-foreground">Productos relacionados</h2>
              <Link
                to={`/categoria/${product.categoria_nombre}`}
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="min-h-[400px]">
              <RelatedProducts category={product.categoria_nombre} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
