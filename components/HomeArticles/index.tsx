
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartPlus,
  Check,
  LoaderCircle,
  Star,
  Pencil,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Fira_Sans } from "next/font/google";

import type { HomeArticlesType } from "@/lib/supabase/queries/articles";
import { createClient } from "@/lib/supabase/client";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type Reservation = {
  product_id: string;
  status: string | null;
};

type ProductReview = {
  product_id: string;
  buyer_id: string;
  rating: number;
  review: string | null;
};

type ReviewDraft = {
  rating: number;
  comment: string;
};

const ACTIVE_STATUSES = ["pending", "confirmed", "reserved"];

export const HomeArticles = ({
  articles,
}: {
  articles: HomeArticlesType;
}) => {
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(
    null
  );
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

  // Track the current user and their role.
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

  // Load all visible active reservations for card labels.
  const fetchReservations = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("reservation")
      .select("product_id, status");

    if (fetchError) {
      console.error("Could not fetch reservations:", {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
      });
      return;
    }

    const rows = (data ?? []) as Reservation[];

    const activeIds = rows
      .filter((item) =>
        ACTIVE_STATUSES.includes(
          (item.status ?? "").toLowerCase()
        )
      )
      .map((item) => item.product_id);

    setReservedIds(new Set(activeIds));
  }, [supabase]);

  // Load active reservations belonging to the current user.
  const fetchMyReservations = useCallback(async () => {
    if (!currentUserId || isSeller) {
      setMyReservedProductIds(new Set());
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("reservation")
      .select("product_id, status")
      .eq("buyer_id", currentUserId)
      .in("status", ACTIVE_STATUSES);

    if (fetchError) {
      console.error("Could not fetch your reservations:", {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
      });
      return;
    }

    setMyReservedProductIds(
      new Set((data ?? []).map((item) => item.product_id))
    );
  }, [supabase, currentUserId, isSeller]);

  // Load reviews from your existing rating table.
  const fetchReviews = useCallback(async () => {
    const { data, error: reviewError } = await supabase
      .from("rating")
      .select("product_id, buyer_id, rating, review");

    if (reviewError) {
      console.error("Could not fetch reviews:", {
        message: reviewError.message,
        code: reviewError.code,
        details: reviewError.details,
      });
      return;
    }

    const grouped: Record<string, ProductReview[]> = {};

    for (const item of (data ?? []) as ProductReview[]) {
      if (!grouped[item.product_id]) {
        grouped[item.product_id] = [];
      }

      grouped[item.product_id].push(item);
    }

    setReviewsByProduct(grouped);
  }, [supabase]);

  // Load the data when the component mounts or user changes.
  useEffect(() => {
    void fetchReservations();
    void fetchReviews();
    void fetchMyReservations();
  }, [fetchReservations, fetchReviews, fetchMyReservations]);

  // Refresh reservation information when reservations change.
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

  // Reserve a product. Sellers cannot reserve.
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

    setLoadingIds((previous) => {
      const next = new Set(previous);
      next.add(productId);
      return next;
    });

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        setError("Could not verify your login. Please try again.");
        return;
      }

      if (!user) {
        setError("Please log in to reserve an article.");
        return;
      }

      if (
        String(user.user_metadata?.role ?? "").toLowerCase() ===
        "seller"
      ) {
        setIsSeller(true);
        setError("Seller accounts cannot reserve products.");
        return;
      }

      // Check whether an active reservation already exists.
      const { data: existing, error: checkError } = await supabase
        .from("reservation")
        .select("id")
        .eq("product_id", productId)
        .in("status", ACTIVE_STATUSES)
        .limit(1);

      if (checkError) {
        console.error("Could not check reservation:", checkError);
        setError(`Could not check availability: ${checkError.message}`);
        return;
      }

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

      if (insertError) {
        console.error("Could not reserve product:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });

        setError(`Reservation failed: ${insertError.message}`);

        await fetchReservations();
        await fetchMyReservations();
        return;
      }

      await fetchReservations();
      await fetchMyReservations();
    } catch (err) {
      console.error("Unexpected reservation error:", err);
      setError("An unexpected error occurred while reserving.");
    } finally {
      setLoadingIds((previous) => {
        const next = new Set(previous);
        next.delete(productId);
        return next;
      });
    }
  };

  // Buyers can review only products they have actively reserved.
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

    setReviewLoadingIds((previous) => {
      const next = new Set(previous);
      next.add(productId);
      return next;
    });

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        setError("Could not verify your login. Please try again.");
        return;
      }

      if (!user) {
        setError("Please log in to write a review.");
        return;
      }

      if (
        String(user.user_metadata?.role ?? "").toLowerCase() ===
        "seller"
      ) {
        setIsSeller(true);
        setError("Seller accounts cannot submit reviews.");
        return;
      }

      // Confirm the user has not already reviewed this product.
      const { data: existing, error: existingError } = await supabase
        .from("rating")
        .select("product_id")
        .eq("product_id", productId)
        .eq("buyer_id", user.id)
        .limit(1);

      if (existingError) {
        console.error("Could not check existing review:", existingError);
        setError(`Could not check reviews: ${existingError.message}`);
        return;
      }

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

      if (insertError) {
        console.error("Could not submit review:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });

        setError(`Could not submit review: ${insertError.message}`);
        return;
      }

      setReviewDrafts((previous) => ({
        ...previous,
        [productId]: { rating: 5, comment: "" },
      }));

      await fetchReviews();
    } catch (err) {
      console.error("Unexpected review error:", err);
      setError("An unexpected error occurred while submitting your review.");
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
          const imageUrl = article.media?.[0]?.media_url ?? null;
          const isReserved = reservedIds.has(article.id);
          const isLoading = loadingIds.has(article.id);

          const canEdit =
            roleLoaded &&
            isSeller &&
            currentUserId !== null &&
            article.seller_id === currentUserId;

          const productReviews = reviewsByProduct[article.id] ?? [];

          const averageRating =
            productReviews.length > 0
              ? productReviews.reduce(
                  (sum, item) => sum + Number(item.rating),
                  0
                ) / productReviews.length
              : 0;

          const reviewDraft = reviewDrafts[article.id] ?? {
            rating: 5,
            comment: "",
          };

          const isReviewLoading = reviewLoadingIds.has(article.id);
          const canReview =
            roleLoaded &&
            !!currentUserId &&
            !isSeller &&
            myReservedProductIds.has(article.id) &&
            !productReviews.some(
              (review) => review.buyer_id === currentUserId
            );

          const alreadyReviewed = productReviews.some(
            (review) => review.buyer_id === currentUserId
          );

          return (
            <article
              key={article.id}
              className={`relative flex min-h-[500px] w-full max-w-[400px] min-w-0 flex-col overflow-hidden rounded-lg shadow-md transition-all duration-300 sm:min-h-[540px] lg:min-h-[560px] ${
                isReserved
                  ? "border-2 border-red-600 bg-red-100"
                  : "bg-articles-bg hover:-translate-y-1 hover:shadow-xl"
              }`}
            >
              {isReserved && (
                <div className="absolute right-3 top-3 z-10 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold tracking-wide text-white shadow-md">
                  RESERVED
                </div>
              )}

              <Link
                href={`/articles/${article.slug}`}
                aria-label={`View ${article.name}`}
                className="flex h-[260px] shrink-0 items-center justify-center p-4 sm:h-[280px] sm:p-5"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={article.name}
                    width={570}
                    height={480}
                    sizes="(max-width: 639px) 95vw, (max-width: 1023px) 48vw, (max-width: 1279px) 32vw, 25vw"
                    className={`h-full w-full object-contain transition-transform duration-500 ${
                      isReserved
                        ? "opacity-60"
                        : "hover:scale-105"
                    }`}
                  />
                ) : (
                  <p className="text-sm text-neutral-500">
                    No image available
                  </p>
                )}
              </Link>

              <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6">
                <Link href={`/articles/${article.slug}`}>
                  <h3 className="mt-4 line-clamp-2 min-h-[76px] text-3xl font-cormorant">
                    {article.name}
                  </h3>
                </Link>

                <p className={`${fira.className} mt-3 text-xl`}>
                  {Number(article.price).toFixed(2)} kr
                </p>

                {/* Only the seller who owns this product sees Edit. */}
                {canEdit && (
                  <Link
                    href={`/articles/${article.slug}/edit`}
                    aria-label={`Edit ${article.name}`}
                    className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-white"
                  >
                    <Pencil size={16} />
                    Edit article
                  </Link>
                )}

                {/* Reviews and average rating. */}
                <div className="mt-4 rounded-lg bg-white/80 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={17}
                          fill={
                            index < Math.round(averageRating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </span>

                    <span className="text-sm text-gray-600">
                      {productReviews.length > 0
                        ? `${averageRating.toFixed(1)} (${productReviews.length} ${
                            productReviews.length === 1
                              ? "review"
                              : "reviews"
                          })`
                        : "No reviews yet"}
                    </span>
                  </div>

                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium underline underline-offset-4">
                      Read reviews / Write a review
                    </summary>

                    <div className="mt-3 space-y-4">
                      {productReviews.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Be the first to review this product.
                        </p>
                      ) : (
                        productReviews.map((item, index) => (
                          <div
                            key={`${item.product_id}-${item.buyer_id}-${index}`}
                            className="border-b border-gray-200 pb-3"
                          >
                            <div className="flex items-center gap-1 text-amber-500">
                              {Array.from(
                                { length: 5 },
                                (_, starIndex) => (
                                  <Star
                                    key={starIndex}
                                    size={15}
                                    fill={
                                      starIndex < item.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                )
                              )}
                            </div>

                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                              {item.review || "No written comment."}
                            </p>
                          </div>
                        ))
                      )}

                      {canReview && (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            void submitReview(article.id);
                          }}
                          className="space-y-3"
                        >
                          <label className="block text-sm font-medium">
                            Your rating
                            <select
                              value={reviewDraft.rating}
                              onChange={(event) =>
                                setReviewDrafts((previous) => ({
                                  ...previous,
                                  [article.id]: {
                                    ...(previous[article.id] ?? {
                                      rating: 5,
                                      comment: "",
                                    }),
                                    rating: Number(event.target.value),
                                  },
                                }))
                              }
                              className="mt-1 block w-full rounded-md border bg-white p-2"
                            >
                              <option value={5}>5 - Excellent</option>
                              <option value={4}>4 - Good</option>
                              <option value={3}>3 - Average</option>
                              <option value={2}>2 - Poor</option>
                              <option value={1}>1 - Very poor</option>
                            </select>
                          </label>

                          <label className="block text-sm font-medium">
                            Your review
                            <textarea
                              value={reviewDraft.comment}
                              onChange={(event) =>
                                setReviewDrafts((previous) => ({
                                  ...previous,
                                  [article.id]: {
                                    ...(previous[article.id] ?? {
                                      rating: 5,
                                      comment: "",
                                    }),
                                    comment: event.target.value,
                                  },
                                }))
                              }
                              required
                              maxLength={2000}
                              rows={3}
                              placeholder="Share your experience..."
                              className="mt-1 block w-full rounded-md border bg-white p-2"
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={isReviewLoading}
                            className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isReviewLoading
                              ? "Submitting..."
                              : "Submit review"}
                          </button>
                        </form>
                      )}

                      {roleLoaded && isSeller && (
                        <p className="text-sm text-gray-500">
                          Sellers cannot write reviews.
                        </p>
                      )}

                      {roleLoaded &&
                        currentUserId &&
                        !isSeller &&
                        !myReservedProductIds.has(article.id) && (
                          <p className="text-sm text-gray-500">
                            Reserve this product before writing a review.
                          </p>
                        )}

                      {roleLoaded &&
                        currentUserId &&
                        alreadyReviewed && (
                          <p className="text-sm text-gray-500">
                            You have already reviewed this product.
                          </p>
                        )}

                      {roleLoaded && !currentUserId && (
                        <p className="text-sm text-gray-500">
                          Log in and reserve this product to write a review.
                        </p>
                      )}
                    </div>
                  </details>
                </div>

                {/* Only buyers see the Reserve button. */}
                {roleLoaded && !isSeller && (
                  <div className="mt-auto flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => void reserveArticle(article.id)}
                      disabled={isReserved || isLoading}
                      aria-label={
                        isReserved
                          ? `${article.name} is reserved`
                          : `Reserve ${article.name}`
                      }
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-full border-2 px-4 transition-colors ${
                        isReserved
                          ? "cursor-not-allowed border-red-600 bg-red-600 text-white"
                          : "border-cyan-100 hover:bg-white"
                      }`}
                    >
                      {isLoading ? (
                        <LoaderCircle
                          size={22}
                          className="animate-spin"
                        />
                      ) : isReserved ? (
                        <>
                          <Check size={22} />
                          <span className="text-sm font-semibold">
                            Reserved
                          </span>
                        </>
                      ) : (
                        <>
                          <ShoppingCartPlus
                            size={24}
                            className="text-amber-600"
                          />
                          <span className="text-sm">Reserve</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
