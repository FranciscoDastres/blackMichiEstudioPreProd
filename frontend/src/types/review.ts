export interface Review {
  id: string | number;
  calificacion?: number;
  comentario?: string;
  usuario_nombre?: string;
  created_at?: string;
  _optimistic?: boolean;
}

export type ReviewAction = "add" | "remove" | "replace";

export type OnReviewChange = (
  data: Review | Review[],
  action: ReviewAction
) => void;
