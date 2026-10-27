
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  getCategories,
  type CategoriesType,
} from "@/lib/supabase/queries/categories";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/supabase/upload-image";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
};

export default function EditProductForm({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoriesType>([]);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(
    product.description ?? ""
  );
  const [price, setPrice] = useState(String(product.price));
  const [categoryId, setCategoryId] = useState(
    product.category_id ?? ""
  );

  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories and the current product image.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const supabase = createClient();

      try {
        const [categoryResult, mediaResult] = await Promise.all([
          getCategories(),
          supabase
            .from("media")
            .select("media_url")
            .eq("product_id", product.id)
            .limit(1)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (categoryResult.error) {
          setError(categoryResult.error);
        } else {
          setCategories(categoryResult.data ?? []);
        }

        if (mediaResult.error) {
          console.error("Could not load product image:", mediaResult.error);
        } else {
          setCurrentImageUrl(mediaResult.data?.media_url ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load product details."
          );
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Preview a newly selected image.
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      setImage(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be smaller than 5 MB.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(file);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const cleanName = name.trim();
      const cleanDescription = description.trim();
      const numericPrice = Number(price);

      if (!cleanName) {
        throw new Error("Please enter a product name.");
      }

      if (!categoryId) {
        throw new Error("Please choose a category.");
      }

      if (
        !price.trim() ||
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        throw new Error("Please enter a valid price.");
      }

      // Upload a replacement image only if one was selected.
      const imageUrl = image
        ? await uploadProductImage(image)
        : null;

      // Update the existing product.
      const { data: updatedProduct, error: updateError } =
        await supabase
          .from("products")
          .update({
            name: cleanName,
            description: cleanDescription || null,
            price: numericPrice,
            category_id: categoryId,
          })
          .eq("id", product.id)
          .eq("seller_id", user.id)
          .select("id")
          .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProduct) {
        throw new Error(
          "Product was not updated. Check your permissions."
        );
      }

      // Update or insert the media record if a new image was uploaded.
      if (image && imageUrl) {
        const { data: existingMedia, error: readMediaError } =
          await supabase
            .from("media")
            .select("product_id")
            .eq("product_id", product.id)
            .limit(1);

        if (readMediaError) throw readMediaError;

        if (existingMedia && existingMedia.length > 0) {
          const { error: updateMediaError } = await supabase
            .from("media")
            .update({
              media_url: imageUrl,
              media_type: image.type,
            })
            .eq("product_id", product.id);

          if (updateMediaError) throw updateMediaError;
        } else {
          const { error: insertMediaError } = await supabase
            .from("media")
            .insert({
              product_id: product.id,
              media_url: imageUrl,
              media_type: image.type,
            });

          if (insertMediaError) throw insertMediaError;
        }
      }

      router.push("/my-products");
      router.refresh();
    } catch (err) {
      console.error("Error updating product:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not update your listing."
      );
    } finally {
      setLoading(false);
    }
  }

  const displayedImage = imagePreview ?? currentImageUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 text-xl sm:text-2xl"
    >
      <div>
        <label htmlFor="name" className="mb-2 block">
          Product name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border p-3"
          placeholder="Enter your product name"
        />
      </div>

      <div>
        <label htmlFor="price" className="mb-2 block">
          Product price
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full rounded-lg border p-3"
          placeholder="Enter your product price"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block">
          Product description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-lg border p-3"
          placeholder="Describe your product"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block">
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          disabled={loadingCategories}
          className="w-full rounded-lg border bg-white p-3"
        >
          <option value="">
            {loadingCategories ? "Loading categories..." : "Choose a category"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="mb-2 block">
          Product image
        </label>

        {displayedImage && (
          <img
            src={displayedImage}
            alt="Product"
            className="mb-4 h-64 w-full rounded-lg border bg-white object-contain p-2"
          />
        )}

        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="w-full rounded-lg border bg-white p-3 text-base"
        />

        <p className="mt-2 text-sm text-gray-500">
          JPG, PNG, or WebP. Maximum 5 MB. Leave empty to keep the
          current image.
        </p>

        {image && (
          <button
            type="button"
            onClick={() => {
              setImage(null);
              const input = document.getElementById(
                "image"
              ) as HTMLInputElement | null;
              if (input) input.value = "";
            }}
            className="mt-2 text-base text-red-600 underline"
          >
            Cancel new image
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-base text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || loadingCategories}
        className="rounded-full bg-gradient-to-r from-orange-400 via-violet-400 to-purple-900 px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  );
}
