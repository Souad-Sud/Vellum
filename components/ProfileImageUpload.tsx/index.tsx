
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "profile-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type ProfileImageUploadProps = {
  currentImageUrl?: string | null;
};

export default function ProfileImageUpload({
  currentImageUrl = null,
}: ProfileImageUploadProps) {
  const [image, setImage] = useState<File | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState(currentImageUrl);
  const [imagePreview, setImagePreview] = useState(currentImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!image) {
      setImagePreview(savedImageUrl);
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image, savedImageUrl]);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    setError(null);
    setSuccess(null);

    if (!file) {
      setImage(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      setImage(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be smaller than 5 MB.");
      event.target.value = "";
      setImage(null);
      return;
    }

    setImage(file);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      // Get the authenticated user.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error("Please log in to upload a profile picture.");
      }

      const extensionByType: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensionByType[image.type];

      if (!extension) {
        throw new Error("Unsupported image type.");
      }

      // Store the image inside this user's folder.
      uploadedPath =
        `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uploadedPath, image, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded image.
      const imageUrl = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadedPath).data.publicUrl;

      // Save the URL to the existing user profile.
      const { error: updateError } = await supabase
        .from("users")
        .update({ image_url_profile: imageUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSavedImageUrl(imageUrl);
      setImage(null);
      setSuccess("Profile picture updated successfully!");
    } catch (err) {
      // Remove the uploaded image if saving the URL failed.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError.message);
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading your image.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 rounded-2xl bg-cream p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold sm:text-xl">
        Profile picture
      </h2>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Image preview */}
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white sm:h-32 sm:w-32">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile picture preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-sm text-gray-500">
              No picture selected
            </span>
          )}
        </div>

        {/* Image selector */}
        <div className="w-full min-w-0">
          <label
            htmlFor="profile-image"
            className="mb-2 block text-sm font-medium"
          >
            Choose a picture
          </label>

          <input
            id="profile-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full min-w-0 rounded-lg border bg-white p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-cream file:px-3 file:py-2"
          />

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG, or WebP. Maximum 5 MB.
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 break-words rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !image}
        className="mt-5 w-full rounded-full bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? "Uploading..." : "Save profile picture"}
      </button>
    </form>
  );
}
