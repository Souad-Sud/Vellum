
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
import { Fira_Sans } from "next/font/google";

import type {
  HomeArticle,
  ProductReview,
  ReviewDraft,
} from "@/types/home-articles";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type ArticleCardProps = {
  article: HomeArticle;
  isReserved: boolean;
  isLoading: boolean;
  canEdit: boolean;
  isSeller: boolean;
  roleLoaded: boolean;
  currentUserId: string | null;
  productReviews: ProductReview[];
  averageRating: number;
  reviewDraft: ReviewDraft;
  isReviewLoading: boolean;
  canReview: boolean;
  alreadyReviewed: boolean;
  hasReservedProduct: boolean;
  onReserve: () => void;
  onReviewSubmit: () => void;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
};

export default function ArticleCard({
  article,
  isReserved,
  isLoading,
  canEdit,
  isSeller,
  roleLoaded,
  currentUserId,
  productReviews,
  averageRating,
  reviewDraft,
  isReviewLoading,
  canReview,
  alreadyReviewed,
  hasReservedProduct,
  onReserve,
  onReviewSubmit,
  onRatingChange,
  onCommentChange,
}: ArticleCardProps) {
  const imageUrl = article.media?.[0]?.media_url ?? null;

  return (
    <article
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
              isReserved ? "opacity-60" : "hover:scale-105"
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
          {article.price == null
            ? "Price unavailable"
            : `${Number(article.price).toFixed(2)} kr`}
        </p>

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
                    productReviews.length === 1 ? "review" : "reviews"
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
                      {Array.from({ length: 5 }, (_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={15}
                          fill={
                            starIndex < item.rating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
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
                    onReviewSubmit();
                  }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-medium">
                    Your rating
                    <select
                      value={reviewDraft.rating}
                      onChange={(event) =>
                        onRatingChange(Number(event.target.value))
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
                        onCommentChange(event.target.value)
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
                    {isReviewLoading ? "Submitting..." : "Submit review"}
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
                !hasReservedProduct && (
                  <p className="text-sm text-gray-500">
                    Reserve this product before writing a review.
                  </p>
                )}

              {roleLoaded && alreadyReviewed && (
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

        {roleLoaded && !isSeller && (
          <div className="mt-auto flex justify-end pt-4">
            <button
              type="button"
              onClick={onReserve}
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
                <LoaderCircle size={22} className="animate-spin" />
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
}
