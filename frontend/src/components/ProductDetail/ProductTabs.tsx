import { Link } from "react-router-dom";
import { Star, Sparkles, Shield, User } from "lucide-react";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string | number;
  calificacion?: number;
  comentario?: string;
  usuario_nombre?: string;
  created_at?: string;
  _optimistic?: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
  isLoggedIn: boolean;
}

function ReviewsList({ reviews, loading, isLoggedIn }: ReviewsListProps) {
  if (loading) return <p className="text-muted">Cargando reseñas...</p>;

  if (reviews.length === 0) {
    return !isLoggedIn ? (
      <div className="glass-panel p-4 rounded-xl">
        <p className="text-sm text-primary">
          Por favor,{" "}
          <Link to="/login" className="font-bold underline">
            inicia sesión
          </Link>{" "}
          para ver y dejar reseñas.
        </p>
      </div>
    ) : (
      <p className="text-muted">
        No hay reseñas aún. ¡Sé el primero en dejar una!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="glass-panel p-5 rounded-xl border border-border"
        >
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
                      className={`w-4 h-4 ${
                        i < (review.calificacion || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-xs text-muted">
              {review.created_at
                ? new Date(review.created_at).toLocaleDateString("es-CL")
                : "Fecha desconocida"}
            </span>
          </div>
          <p className="text-muted">{review.comentario || ""}</p>
        </div>
      ))}
    </div>
  );
}

interface ApiProduct {
  descripcion?: string;
  descripcion_larga?: string;
}

type TabKey = "description" | "specs" | "reviews";

interface ProductTabsProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  product: ApiProduct;
  reviews: Review[];
  loadingReviews: boolean;
  isLoggedIn: boolean;
  currentUser?: { nombre?: string } | null;
  productId: number;
  onNewReview: (data: Review | Review[], action: "add" | "remove" | "replace") => void;
}

export default function ProductTabs({
  activeTab,
  setActiveTab,
  product,
  reviews,
  loadingReviews,
  isLoggedIn,
  currentUser,
  productId,
  onNewReview,
}: ProductTabsProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-border mb-8">
      {/* Navegación */}
      <div className="border-b border-border">
        <nav className="flex space-x-1 px-6" role="tablist">
          {([
            ["description", "Descripción"],
            ["specs", "Especificaciones"],
            ["reviews", "Reseñas"],
          ] as [TabKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-4 px-6 font-semibold text-sm border-b-2 transition-all ${
                activeTab === key
                  ? "text-primary border-primary"
                  : "text-muted border-transparent hover:text-foreground"
              }`}
              role="tab"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "description" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">
              Descripción del Producto
            </h3>
            <div className="prose prose-invert max-w-none text-muted leading-relaxed">
              {product.descripcion_larga ||
                product.descripcion ||
                "Producto personalizado impreso en 3D, ideal para regalos únicos y decoraciones especiales."}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Impresión 3D de alta calidad
                  </h4>
                  <p className="text-sm text-muted mt-1">
                    Detalles precisos y acabado profesional
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Material duradero
                  </h4>
                  <p className="text-sm text-muted mt-1">
                    Resistente y de larga duración
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">
              Especificaciones Técnicas
            </h3>
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
                <p className="font-semibold text-foreground">
                  10cm x 10cm x 10cm
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">
                Reseñas de clientes
              </h3>
              <ReviewsList
                reviews={reviews}
                loading={loadingReviews}
                isLoggedIn={isLoggedIn}
              />
            </div>

            {isLoggedIn && (
              <ReviewForm
                productId={productId}
                onNewReview={onNewReview}
                currentUser={currentUser}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
