
import type { HomeArticlesType } from "@/lib/supabase/queries/articles";

export type HomeArticle = HomeArticlesType[number];

export type Reservation = {
  product_id: string;
  status: string | null;
};

export type ProductReview = {
  product_id: string;
  buyer_id: string;
  rating: number;
  review: string | null;
};

export type ReviewDraft = {
  rating: number;
  comment: string;
};
