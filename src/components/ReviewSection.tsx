import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { fetchReviews, createReview, deleteReview, type Review } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  professionalId: string;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-5 w-5 transition-colors",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
            interactive && "cursor-pointer hover:text-amber-400"
          )}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({ professionalId }: Props) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", professionalId],
    queryFn: () => fetchReviews(professionalId),
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const userReview = reviews.find((r) => r.user_id === user?.id);

  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", professionalId] });
      toast.success("¡Reseña publicada!");
      setRating(0);
      setComment("");
      setShowForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", professionalId] });
      toast.success("Reseña eliminada");
    },
    onError: () => toast.error("Error al eliminar la reseña"),
  });

  const handleSubmit = () => {
    if (!user) return toast.error("Inicia sesión para dejar una reseña");
    if (rating === 0) return toast.error("Selecciona una calificación");
    createMutation.mutate({
      professional_id: professionalId,
      user_id: user.id,
      reviewer_name: profile?.full_name || user.email || "Anónimo",
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold">Reseñas</h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(Number(avgRating))} />
              <span className="text-sm text-muted-foreground">
                {avgRating} · {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
              </span>
            </div>
          )}
        </div>
        {user && !userReview && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Escribir reseña
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/30">
          <p className="text-sm font-medium">Tu calificación</p>
          <StarRating rating={rating} onRate={setRating} interactive />
          <Textarea
            placeholder="Comparte tu experiencia (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setRating(0); setComment(""); }}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending || rating === 0}>
              {createMutation.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      )}

      {reviews.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground py-4 text-center">Aún no hay reseñas. ¡Sé el primero!</p>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-border p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.reviewer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), "d MMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                {user?.id === review.user_id && (
                  <button
                    onClick={() => deleteMutation.mutate(review.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Eliminar reseña"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
