import { useState } from "react";
import { toast } from "sonner";
import { User, MessageSquare } from "lucide-react";
import api from "../../services/api";
import type { Review, OnReviewChange } from "../../types/review";

interface ReviewFormProps {
  productId: number;
  onNewReview: OnReviewChange;
  currentUser?: { nombre?: string } | null;
}

export default function ReviewForm({ productId, onNewReview, currentUser }: ReviewFormProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0 || !reviewText.trim()) {
      toast.error("Por favor, completa la calificación y el comentario.");
      return;
    }

    setIsSubmitting(true);

    // Optimistic update
    const optimistic: Review = {
      id: `temp-${Date.now()}`,
      calificacion: rating,
      comentario: reviewText.trim(),
      usuario_nombre: currentUser?.nombre || "Tú",
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    onNewReview(optimistic, "add");

    try {
      await api.post("/reviews", {
        producto_id: productId,
        calificacion: rating,
        comentario: reviewText.trim(),
      });

      // Refetch para tener los datos reales
      const updated = await api.get<Review[]>(`/reviews?producto_id=${productId}`);
      if (Array.isArray(updated.data)) onNewReview(updated.data, "replace");

      setReviewText("");
      setRating(0);
      toast.success("¡Gracias por tu reseña!");
    } catch (error: unknown) {
      onNewReview(optimistic, "remove");
      const axiosErr = error as { response?: { data?: { error?: string } } };
      const serverMsg = axiosErr.response?.data?.error;
      toast.error(serverMsg || "Hubo un problema al enviar tu reseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled =
    isSubmitting || rating === 0 || reviewText.trim().length === 0;

  return (
    <div className="glass-panel p-6 rounded-xl border border-border">
      <h4 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Escribe tu reseña
      </h4>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calificación */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Tu calificación
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${
                  star <= rating ? "text-yellow-400" : "text-muted/30"
                }`}
                aria-label={`Calificar con ${star} estrellas`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-3">
          <label
            htmlFor="review-text"
            className="block text-sm font-medium text-foreground"
          >
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
        </div>

        <button
          type="submit"
          disabled={disabled}
          className={`btn-add-cart !px-8 !py-3 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
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
  );
}
