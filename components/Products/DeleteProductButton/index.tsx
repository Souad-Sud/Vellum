
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  productId: string;
};

export default function DeleteProductButton({
  productId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc(
        "delete_my_product",
        { p_product_id: productId }
      );

      if (error) {
        throw error;
      }

      alert("Product deleted successfully!");
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="mt-3 inline-flex w-fit items-center text-white gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium bg-red-500 transition hover:bg-white"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
