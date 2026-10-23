
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { HomeArticlesType } from "@/lib/supabase/queries/articles";
import { createClient } from "@/lib/supabase/client";

import ArticleCard from "./ArticleCard";
import type {
  ProductReview,
  ReviewDraft,
  Reservation,
} from "@/types/home-articles";

const ACTIVE_STATUSES = ["pending", "confirmed", "reserved"];

export const HomeArticles = ({
  articles,
}: {
  articles: HomeArticlesType;
}) => {
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const [reservedIds, setReservedIds] = useState<Set<string>>(
    () => new Set()
  );
  const [myReservedProductIds, setMyReservedProductIds] = useState<
    Set<string>
  >(() => new Set());

  const [loadingIds, setLoadingIds] = useState<Set<string>>(
    () => new Set()
  );
  const [reviewsByProduct, setReviewsByProduct] = useState<
    Record<string, ProductReview[]>
  >({});
  const [reviewDrafts, setReviewDrafts] = useState<
    Record<string, ReviewDraft>
  >({});
  const [reviewLoadingIds, setReviewLoadingIds] = useState<Set<string>>(
    () => new Set()
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const updateUser = (
      user: {
        id: string;
        user_metadata?: Record<string, unknown>;
      } | null
    ) => {
      if (!mounted) return;

      setCurrentUserId(user?.id ?? null);

      const role = user?.user_metadata?.role;

      setIsSeller(
        typeof role === "string" &&
          role.toLowerCase() === "seller"
      );

      setRoleLoaded(true);
    };

    const checkUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authError) {
        console.error("Could not check user:", authError.message);
      }

      updateUser(user);
    };

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchReservations = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("reservation")
      .select("product_id, status");

    if (queryError) {
      console.error("Could not fetch reservations:", queryError.message);
      return;
    }

    const rows = (data ?? []) as Reservation[];

    setReservedIds(
      new Set(
        rows
          .filter((item) =>
            ACTIVE_STATUSES.includes((item.status ?? "").toLowerCase())
          )
          .map((item) => item.product_id)
      )
    );
  }, [supabase]);

  const fetchMyReservations = useCallback(async () => {
    if (!currentUserId || isSeller) {
      setMyReservedProductIds(new Set());
      return;
    }

    const { data, error: queryError } = await supabase
      .from("reservation")
      .select("product_id, status")
      .eq("buyer_id", currentUserId)
      .in("status", ACTIVE_STATUSES);

    if (queryError) {
      console.error("Could not fetch your reservations:", queryError.message);
      return;
    }

    setMyReservedProductIds(
      new Set((data ?? []).map((item) => item.product_id))
    );
  }, [supabase, currentUserId, isSeller]);

  const fetchReviews = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("rating")
      .select("product_id, buyer_id, rating, review");

    if (queryError) {
      console.error("Could not fetch reviews:", queryError.message);
      return;
    }

    const grouped: Record<string, ProductReview[]> = {};

    for (const review of (data ?? []) as ProductReview[]) {
      if (!grouped[review.product_id]) {
        grouped[review.product_id] = [];
      }

      grouped[review.product_id].push(review);
    }

    setReviewsByProduct(grouped);
  }, [supabase]);

  useEffect(() => {
    void fetchReservations();
    void fetchMyReservations();
    void fetchReviews();
  }, [fetchReservations, fetchMyReservations, fetchReviews]);

  useEffect(() => {
    const channel = supabase
      .channel("reservation-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservation",
        },
        () => {
          void fetchReservations();
          void fetchMyReservations();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, fetchReservations, fetchMyReservations]);

  const reserveArticle = async (productId: string) => {
    if (
      !roleLoaded ||
      isSeller ||
      reservedIds.has(productId) ||
      loadingIds.has(productId)
    ) {
      return;
    }

    setError(null);
    setLoadingIds((previous) => new Set(previous).add(productId));

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setError("Please log in to reserve an article.");
        return;
      }

      if (
        String(user.user_metadata?.role ?? "").toLowerCase() === "seller"
      ) {
        setIsSeller(true);
        setError("Seller accounts cannot reserve products.");
        return;
      }

      const { data: existing, error: checkError } = await supabase
        .from("reservation")
        .select("id")
        .eq("product_id", productId)
        .in("status", ACTIVE_STATUSES)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        await fetchReservations();
        await fetchMyReservations();
        setError("This product has already been reserved.");
        return;
      }

      const { error: insertError } = await supabase
        .from("reservation")
        .insert({
          product_id: productId,
          buyer_id: user.id,
          quantity: 1,
          status: "pending",
        });

      if (insertError) throw insertError;

      await fetchReservations();
      await fetchMyReservations();
    } catch (err) {
      console.error("Could not reserve product:", err);

      setError(
        err instanceof Error
          ? `Reservation failed: ${err.message}`
          : "Could not reserve this product."
      );
    } finally {
      setLoadingIds((previous) => {
        const next = new Set(previous);
        next.delete(productId);
        return next;
      });
    }
  };

  const submitReview = async (productId: string) => {
    if (!roleLoaded) return;

    if (isSeller) {
      setError("Seller accounts cannot submit reviews.");
      return;
    }

    if (!currentUserId || !myReservedProductIds.has(productId)) {
      setError("You can review only products you have reserved.");
      return;
    }

    const draft = reviewDrafts[productId] ?? {
      rating: 5,
      comment: "",
    };

    if (!draft.comment.trim()) {
      setError("Please write a review before submitting.");
      return;
    }

    setError(null);
    setReviewLoadingIds((previous) => new Set(previous).add(productId));

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setError("Please log in to write a review.");
        return;
      }

      if (
        String(user.user_metadata?.role ?? "").toLowerCase() === "seller"
      ) {
        setIsSeller(true);
        setError("Seller accounts cannot submit reviews.");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("rating")
        .select("product_id")
        .eq("product_id", productId)
        .eq("buyer_id", user.id)
        .limit(1);

      if (existingError) throw existingError;

      if (existing && existing.length > 0) {
        setError("You have already reviewed this product.");
        return;
      }

      const { error: insertError } = await supabase
        .from("rating")
        .insert({
          product_id: productId,
          buyer_id: user.id,
          rating: draft.rating,
          review: draft.comment.trim(),
        });

      if (insertError) throw insertError;

      setReviewDrafts((previous) => ({
        ...previous,
        [productId]: { rating: 5, comment: "" },
      }));

      await fetchReviews();
    } catch (err) {
      console.error("Could not submit review:", err);

      setError(
        err instanceof Error
          ? `Could not submit review: ${err.message}`
          : "Could not submit your review."
      );
    } finally {
      setReviewLoadingIds((previous) => {
        const next = new Set(previous);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 break-words text-center text-sm text-red-600"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mx-auto grid w-full max-w-[2000px] grid-cols-1 justify-items-center gap-6 px-2 sm:grid-cols-2 sm:px-3 lg:grid-cols-3 lg:gap-7 xl:grid-cols-4 2xl:gap-8">
        {articles.map((article) => {
          const productReviews = reviewsByProduct[article.id] ?? [];

          const averageRating =
            productReviews.length > 0
              ? productReviews.reduce(
                  (sum, review) => sum + Number(review.rating),
                  0
                ) / productReviews.length
              : 0;

          const reviewDraft = reviewDrafts[article.id] ?? {
            rating: 5,
            comment: "",
          };

          const alreadyReviewed = productReviews.some(
            (review) => review.buyer_id === currentUserId
          );

          const canEdit =
            roleLoaded &&
            isSeller &&
            currentUserId !== null &&
            article.seller_id === currentUserId;

          const canReview =
            roleLoaded &&
            currentUserId !== null &&
            !isSeller &&
            myReservedProductIds.has(article.id) &&
            !alreadyReviewed;

          return (
            <ArticleCard
              key={article.id}
              article={article}
              isReserved={reservedIds.has(article.id)}
              isLoading={loadingIds.has(article.id)}
              canEdit={canEdit}
              isSeller={isSeller}
              roleLoaded={roleLoaded}
              currentUserId={currentUserId}
              productReviews={productReviews}
              averageRating={averageRating}
              reviewDraft={reviewDraft}
              isReviewLoading={reviewLoadingIds.has(article.id)}
              canReview={canReview}
              alreadyReviewed={alreadyReviewed}
              hasReservedProduct={myReservedProductIds.has(article.id)}
              onReserve={() => void reserveArticle(article.id)}
              onReviewSubmit={() => void submitReview(article.id)}
              onRatingChange={(rating) =>
                setReviewDrafts((previous) => ({
                  ...previous,
                  [article.id]: {
                    ...(previous[article.id] ?? {
                      rating: 5,
                      comment: "",
                    }),
                    rating,
                  },
                }))
              }
              onCommentChange={(comment) =>
                setReviewDrafts((previous) => ({
                  ...previous,
                  [article.id]: {
                    ...(previous[article.id] ?? {
                      rating: 5,
                      comment: "",
                    }),
                    comment,
                  },
                }))
              }
            />
          );
        })}
      </div>
    </div>
  );
};
