import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import RelatedProducts from "../components/RelatedProducts/RelatedProducts";
import ApiService from "../services/api";
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
  Zap
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Hook de autenticación local simplificado
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

// Utilidad para asegurar rutas .webp
function toWebpPath(path) {
  if (!path) return null;
  return path.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
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

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await ApiService.getProductoPorId(productId);
        setProduct(data);
        setSelectedImgIndex(0);
        setQuantity(1);

        setLoadingReviews(true);
        const reviewsData = await ApiService.getReviewsByProduct(productId);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        setError(err.message || "Error al cargar producto");
      } finally {
        setLoading(false);
        setLoadingReviews(false);
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
      await ApiService.submitReview({
        producto_id: productId,
        usuario_id: user?.id,
        calificacion: rating,
        comentario: reviewText.trim(),
      });

      const updatedReviews = await ApiService.getReviewsByProduct(productId);
      setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);

      setReviewText("");
      setRating(0);
      alert("¡Gracias por tu reseña!");
    } catch (error) {
      setSubmitError(error.message || "No se pudo enviar la reseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{error || "Producto no encontrado"}</h2>
        <Link to="/" className="text-primary hover:underline">Volver a la tienda</Link>
      </div>
    );
  }

  // Preparación de Imágenes
  const rawImages = [toWebpPath(product.imagen_principal)].filter(Boolean);
  if (product.imagenes_adicionales?.length > 0) {
    rawImages.push(...product.imagenes_adicionales.map(toWebpPath).filter(Boolean));
  }
  const images = rawImages.map(img => `${API_BASE_URL}/${img}`);
  const mainImage = images[selectedImgIndex] || "/placeholder.svg";

  const CLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  const stock = product.stock ?? 0;
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={18} /> <span>Volver a la tienda</span>
        </Link>

        {/* Sección Principal */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 items-start">
          {/* Galería */}
          <div className="space-y-4">
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-card border border-border/50 cursor-zoom-in"
              onMouseMove={handleImageZoom}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={mainImage}
                alt={product.titulo}
                className={`w-full h-full object-contain transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImgIndex === idx ? "border-primary scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Información */}
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <span className="text-primary font-bold text-xs uppercase tracking-widest">{product.categoria_nombre}</span>
              <h1 className="text-4xl font-black mt-2 mb-4 leading-tight">{product.titulo}</h1>
              <div className="flex items-center gap-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(avgRating) ? "fill-current" : "text-muted"} />)}
                </div>
                <span className="text-sm text-muted-foreground">({reviews.length} reseñas)</span>
                <span className={`text-xs px-2 py-1 rounded-full ${stock > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                  {stock > 0 ? `${stock} en stock` : "Agotado"}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-foreground">{CLP.format(product.precio)}</span>
                {product.precio_anterior && (
                  <span className="text-xl text-muted-foreground line-through">{CLP.format(product.precio_anterior)}</span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">{product.descripcion}</p>

            <div className="space-y-6 mt-auto">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-secondary/50 rounded-2xl p-1 border border-border">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:text-primary"><Minus size={18} /></button>
                  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(stock, q + 1))} className="p-3 hover:text-primary"><Plus size={18} /></button>
                </div>
                <button
                  disabled={stock <= 0 || isStockExceeded(product)}
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) addToCart(product);
                  }}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag size={20} />
                  {stock > 0 ? "Agregar al Carrito" : "Agotado"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/50">
                  <Truck className="text-primary" />
                  <div><p className="text-xs font-bold uppercase">Envío Rápido</p><p className="text-[10px] text-muted-foreground">3-5 días hábiles</p></div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/50">
                  <Shield className="text-primary" />
                  <div><p className="text-xs font-bold uppercase">Seguridad</p><p className="text-[10px] text-muted-foreground">Garantía total</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas (Descripción/Reseñas) */}
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden mb-20">
          <div className="flex border-b border-border">
            {["description", "reviews"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground"}`}
              >
                {tab === "description" ? "Descripción" : "Reseñas"}
              </button>
            ))}
          </div>
          <div className="p-8">
            {activeTab === "description" ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-loose">{product.descripcion_larga || product.descripcion}</p>
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-background rounded-xl flex items-start gap-4">
                    <Zap className="text-yellow-400 shrink-0" />
                    <div><h4 className="font-bold">Alta Calidad</h4><p className="text-sm text-muted-foreground">Impresión en PLA Premium con post-procesado manual.</p></div>
                  </div>
                  <div className="p-4 bg-background rounded-xl flex items-start gap-4">
                    <Sparkles className="text-sky-400 shrink-0" />
                    <div><h4 className="font-bold">Diseño Único</h4><p className="text-sm text-muted-foreground">Cada pieza es revisada para asegurar detalles perfectos.</p></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-bold">Reseñas de la comunidad</h3>
                    {isLoggedIn ? (
                      <div className="space-y-4 p-6 bg-background rounded-2xl border border-border">
                        <p className="text-sm font-bold uppercase text-primary">Deja tu opinión</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRating(s)} className={`text-2xl ${s <= rating ? "text-yellow-400" : "text-muted"}`}>★</button>
                          ))}
                        </div>
                        <textarea
                          className="w-full bg-card border border-border rounded-xl p-4 text-sm focus:ring-2 ring-primary outline-none"
                          rows="4"
                          placeholder="Tu mensaje..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                        />
                        <button
                          onClick={handleReviewSubmit}
                          disabled={isSubmitting}
                          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                          {isSubmitting ? "Enviando..." : "Publicar Reseña"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 bg-secondary/20 rounded-2xl text-center">
                        <p className="text-sm text-muted-foreground">Debes <Link to="/login" className="text-primary font-bold">iniciar sesión</Link> para dejar una reseña.</p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    {reviews.length > 0 ? reviews.map(rev => (
                      <div key={rev.id} className="p-6 bg-background rounded-2xl border border-border/50">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><User size={20} className="text-primary" /></div>
                            <div>
                              <p className="font-bold text-sm">{rev.usuario_nombre || "Cliente"}</p>
                              <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < rev.calificacion ? "fill-current" : "text-muted"} />)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rev.comentario}</p>
                      </div>
                    )) : <p className="text-muted-foreground text-center py-10">Aún no hay reseñas para este producto.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productos Relacionados */}
        <RelatedProducts category={product.categoria_nombre} />
      </div>
    </div>
  );
}