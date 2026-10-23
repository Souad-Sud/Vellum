
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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

const CreateListingForm = () => {
  const [categories, setCategories] = useState<CategoriesType>([]);
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load product categories.
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await getCategories();

      if (error) {
        setError(error);
        return;
      }

      setCategories(data ?? []);
    };

    fetchCategories();
  }, []);

  // Create and clean up the local image preview.
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  // Validate the selected image.
  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setError(null);
    setSuccess(null);

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

  // Create the listing and save its image URL.
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const supabase = createClient();

    let productCreated = false;

    try {
      // 1. Verify the logged-in user.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("Please log in before creating a listing.");
      }

      // 2. Read and validate the form fields.
      const name = String(
        formData.get("name") ?? ""
      ).trim();

      const description = String(
        formData.get("description") ?? ""
      ).trim();

      const rawPrice = String(
        formData.get("price") ?? ""
      ).trim();

      const price = Number(rawPrice);

      if (!name) {
        throw new Error("Please enter a product name.");
      }

      if (!categoryId) {
        throw new Error("Please choose a category.");
      }

      if (
        !rawPrice ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        throw new Error("Please enter a valid price.");
      }

      // 3. Generate a unique product slug.
      const baseSlug =
        name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "product";

      const slug = `${baseSlug}-${crypto
        .randomUUID()
        .slice(0, 8)}`;

      // 4. Upload the image through the reusable helper.
      // The helper uploads to your product images bucket.
      let imageUrl: string | null = null;

      if (image) {
        imageUrl = await uploadProductImage(image);
      }

      // 5. Create the product database record.
      const { data: product, error: productError } =
        await supabase
          .from("products")
          .insert({
            name,
            description: description || null,
            price,
            slug,
            category_id: categoryId,
            seller_id: user.id,
          })
          .select("id")
          .single();

      if (productError) {
        throw productError;
      }

      productCreated = true;

      // 6. Save the uploaded image URL in the media table.
      if (imageUrl && product && image) {
        const { error: mediaError } = await supabase
          .from("media")
          .insert({
            product_id: product.id,
            media_url: imageUrl,
            media_type: image.type,
          });

        if (mediaError) {
          throw new Error(
            `Your product was created, but saving its image record failed: ${mediaError.message}`
          );
        }
      }

      // 7. Reset the form after successful creation.
      setSuccess("Your listing was created successfully!");
      setImage(null);
      setCategoryId("");
      form.reset();
    } catch (err) {
      console.error("Error creating listing:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your listing."
      );

      if (productCreated) {
        console.error(
          "The product was created, but a later operation failed. Check your product and media records in Supabase."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          name="name"
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
          name="price"
          type="number"
          min="0"
          step="0.01"
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
          name="description"
          required
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
          name="category_id"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          required
          className="w-full rounded-lg border bg-white p-3"
        >
          <option value="">Choose a category</option>

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

        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="w-full rounded-lg border bg-white p-3 text-base"
        />

        <p className="mt-2 text-sm text-gray-500">
          JPG, PNG, or WebP. Maximum file size: 5 MB.
        </p>

        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Product preview"
              className="h-64 w-full rounded-lg border bg-white object-contain p-2"
            />

            <button
              type="button"
              onClick={() => {
                setImage(null);

                const fileInput = document.getElementById(
                  "image"
                ) as HTMLInputElement | null;

                if (fileInput) {
                  fileInput.value = "";
                }
              }}
              className="mt-2 text-base text-red-600 underline"
            >
              Remove image
            </button>
          </div>
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

      {success && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-base text-green-700"
        >
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-gradient-to-r from-orange-400 via-violet-400 to-purple-900 px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating listing..." : "Create listing"}
      </button>
    </form>
  );
};

export default CreateListingForm;
