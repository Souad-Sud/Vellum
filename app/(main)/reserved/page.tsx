
"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Reservation = {
  id: string;
  created_at: string;
  quantity: number;
  status: string | null;
  product_id: string;
};

type Article = {
  id: string;
  slug: string;
  name: string;
  price: number | string | null;
  media: { media_url: string | null }[] | null;
};

type ReservedItem = Reservation & {
  article: Article | null;
};

const ACTIVE_STATUSES = ["pending", "confirmed", "reserved"];

export default function ReservedPage() {
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<ReservedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setItems([]);
        setError("Please log in to see your reserved articles.");
        return;
      }

      const { data: reservations, error: reservationError } =
        await supabase
          .from("reservation")
          .select("id, created_at, quantity, status, product_id")
          .eq("buyer_id", user.id)
          .in("status", ACTIVE_STATUSES)
          .order("created_at", { ascending: false });

      if (reservationError) throw reservationError;

      const rows = (reservations ?? []) as Reservation[];

      if (rows.length === 0) {
        setItems([]);
        return;
      }

      const productIds = [
        ...new Set(rows.map((reservation) => reservation.product_id)),
      ];

      const { data: products, error: productError } = await supabase
        .from("products")
        .select("id, slug, name, price, media(media_url)")
        .in("id", productIds);

      if (productError) throw productError;

      const productMap = new Map(
        ((products ?? []) as Article[]).map((product) => [
          product.id,
          product,
        ])
      );

      setItems(
        rows.map((reservation) => ({
          ...reservation,
          article: productMap.get(reservation.product_id) ?? null,
        }))
      );
    } catch (err) {
      console.error("Could not load reserved articles:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your reservations."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  // Cancel a pending reservation and release the product.
  const cancelReservation = async (item: ReservedItem) => {
    if ((item.status ?? "").toLowerCase() !== "pending") {
      setError("Only pending reservations can be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Cancel this reservation? The article will become available to reserve again."
    );

    if (!confirmed) return;

    setCancellingId(item.id);
    setError(null);
    setNotice(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in to cancel your reservation.");
      }

      // Only cancel this user's own pending reservation.
      const { data: updated, error: updateError } = await supabase
        .from("reservation")
        .update({ status: "cancelled" })
        .eq("id", item.id)
        .eq("buyer_id", user.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updated) {
        throw new Error(
          "The reservation could not be cancelled. It may already have changed."
        );
      }

      // Cancelled reservations are excluded from the active list.
      await loadReservations();

      setNotice(
        "Reservation cancelled. The article is available to reserve again."
      );
    } catch (err) {
      console.error("Could not cancel reservation:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not cancel the reservation."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          My Reserved Articles
        </h1>

        <Link
          href="/homepage"
          className="rounded-full border px-5 py-2 transition hover:bg-gray-100"
        >
          Browse articles
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {notice}
        </p>
      )}

      {loading && (
        <p className="py-10 text-center text-gray-500">
          Loading your reservations...
        </p>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadReservations()}
            className="mt-3 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-xl font-medium">
            No reserved articles
          </h2>

          <p className="mt-2 text-gray-500">
            Articles you reserve will appear here.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white hover:bg-gray-800"
          >
            Explore articles
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const article = item.article;
            const imageUrl = article?.media?.[0]?.media_url;
            const canCancel =
              (item.status ?? "").toLowerCase() === "pending";
            const isCancelling = cancellingId === item.id;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border-2 border-red-200 bg-red-50 shadow-sm"
              >
                <div className="relative flex h-60 items-center justify-center bg-white p-5">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={article?.name ?? "Reserved article"}
                      width={500}
                      height={400}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <p className="text-gray-500">
                      No image available
                    </p>
                  )}

                  {canCancel ? (
                    <button
                      type="button"
                      onClick={() => void cancelReservation(item)}
                      disabled={isCancelling}
                      title="Click to cancel this pending reservation"
                      className="absolute right-3 top-3 rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold uppercase text-white hover:bg-amber-600 disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Pending · Cancel"}
                    </button>
                  ) : (
                    <span className="absolute right-3 top-3 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold uppercase text-white">
                      {item.status ?? "Reserved"}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-2xl font-semibold">
                    {article?.name ?? "Article details unavailable"}
                  </h2>

                  <p className="mt-3 text-lg">
                    {article?.price == null
                      ? "Price unavailable"
                      : `${Number(article.price).toFixed(2)} kr`}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Reserved on{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>

                  {article?.slug && (
                    <Link
                      href={`/articles/${article.slug}`}
                      className="mt-5 inline-block font-medium underline underline-offset-4"
                    >
                      View article
                    </Link>
                  )}

                  {canCancel && (
                    <p className="mt-3 text-xs text-gray-500">
                      Click Pending · Cancel to release this article.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
