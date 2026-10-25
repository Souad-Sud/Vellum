
"use client";

import { useEffect, useState } from "react";
import {
  MAX_FILE_SIZE,
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
  validateProfileImage,
} from "@/utils/profile";

type ProfileImageFieldProps = {
  mode: "create" | "edit";
  initialImage?: string | null;
};

export default function ProfileImageField({
  mode,
  initialImage,
}: ProfileImageFieldProps) {
  const [preview, setPreview] = useState<string | null>(
    initialImage ?? null
  );
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setImageError(null);

    if (!file) {
      setPreview(initialImage ?? null);
      return;
    }

    const error = validateProfileImage(file);

    if (error) {
      setImageError(error);
      event.target.value = "";
      setPreview(initialImage ?? null);
      return;
    }

    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="mb-5 sm:mb-6">
      <label
        htmlFor={`${mode}-profile-image`}
        className={PROFILE_LABEL_CLASS}
      >
        Profile picture (optional)
      </label>

      {preview && (
        <div className="mb-3">
          <img
            src={preview}
            alt="Profile picture preview"
            className="h-24 w-24 rounded-full border border-gray-300 object-cover"
          />
        </div>
      )}

      <input
        id={`${mode}-profile-image`}
        name="profile_image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageChange}
        className={PROFILE_INPUT_CLASS}
      />

      <p className="mt-2 text-xs text-gray-500">
        JPG, PNG, or WebP. Maximum{" "}
        {MAX_FILE_SIZE / (1024 * 1024)} MB.
      </p>

      {imageError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {imageError}
        </p>
      )}
    </div>
  );
}
