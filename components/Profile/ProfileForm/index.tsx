"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type Profile = {
  username?: string | null;
  address?: string | null;
  city?: string | null;
  zip_code?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  role?: string | null;
  description?: string | null;
  profile_image?: string | null;
};

export type ProfileFormState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

type ProfileFormProps = {
  mode: "create" | "edit";
  profile?: Profile;
  state: ProfileFormState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

export default function ProfileForm({
  mode,
  profile,
  state,
  formAction,
  pending,
}: ProfileFormProps) {
  const isEditing = mode === "edit";

  const [imagePreview, setImagePreview] = useState<string | null>(
    profile?.profile_image ?? null
  );
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Original CreateAccount styles
  const inputClass =
    "block w-full min-w-0 rounded-lg border border-gray-300 bg-input px-3 py-3 text-base outline-none transition-colors duration-300 placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 sm:px-4";

  const labelClass = "mb-2 block text-sm font-semibold";

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setImageError(null);

    if (!file) {
      setImagePreview(profile?.profile_image ?? null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      setImagePreview(profile?.profile_image ?? null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("Your image must be 5 MB or smaller.");
      event.target.value = "";
      setImagePreview(profile?.profile_image ?? null);
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <form
      action={formAction}
      className="mb-6 w-full min-w-0 rounded-xl bg-cream p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8"
    >
      <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">
        {isEditing ? "Edit your profile" : "Create your account"}
      </h2>

      {state?.error && (
        <p
          role="alert"
          className="mb-4 break-words rounded-lg bg-red-100 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state?.message && (
        <p
          role="status"
          className="mb-4 break-words rounded-lg bg-green-100 p-3 text-sm text-green-800"
        >
          {state.message}
        </p>
      )}

      {/* Profile picture */}
      <div className="mb-5 sm:mb-6">
        <label htmlFor={`${mode}-profile-image`} className={labelClass}>
          Profile picture (optional)
        </label>

        {imagePreview && (
          <div className="mb-3">
            <img
              src={imagePreview}
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
          className={inputClass}
        />

        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG, or WebP. Maximum 5 MB.
        </p>

        {imageError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {imageError}
          </p>
        )}
      </div>

      {/* Username */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-username`} className={labelClass}>
          Username
        </label>

        <input
          id={`${mode}-username`}
          name="username"
          required
          minLength={6}
          autoComplete="username"
          defaultValue={profile?.username ?? ""}
          placeholder="Choose a username..."
          className={inputClass}
        />

        <FieldError name="username" errors={state?.fieldErrors} />
      </div>

      {/* Email: signup only */}
      {!isEditing && (
        <div className="mb-4 sm:mb-5">
          <label htmlFor="create-email" className={labelClass}>
            Email
          </label>

          <input
            id="create-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email..."
            className={inputClass}
          />

          <FieldError name="email" errors={state?.fieldErrors} />
        </div>
      )}

      {/* Password: signup only */}
      {!isEditing && (
        <div className="mb-4 sm:mb-5">
          <label htmlFor="create-password" className={labelClass}>
            Password
          </label>

          <input
            id="create-password"
            name="password"
            type="password"
            required
            minLength={5}
            autoComplete="new-password"
            placeholder="Create a password..."
            className={inputClass}
          />

          <FieldError name="password" errors={state?.fieldErrors} />
        </div>
      )}

      {/* Address */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-address`} className={labelClass}>
          Address
        </label>

        <input
          id={`${mode}-address`}
          name="address"
          required
          autoComplete="street-address"
          defaultValue={profile?.address ?? ""}
          placeholder="Enter your address..."
          className={inputClass}
        />

        <FieldError name="address" errors={state?.fieldErrors} />
      </div>

      {/* City */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-city`} className={labelClass}>
          City
        </label>

        <input
          id={`${mode}-city`}
          name="city"
          required
          autoComplete="address-level2"
          defaultValue={profile?.city ?? ""}
          placeholder="Enter your city..."
          className={inputClass}
        />

        <FieldError name="city" errors={state?.fieldErrors} />
      </div>

      {/* ZIP code */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-zip`} className={labelClass}>
          ZIP code
        </label>

        <input
          id={`${mode}-zip`}
          name="zip_code"
          required
          autoComplete="postal-code"
          defaultValue={profile?.zip_code ?? ""}
          placeholder="Enter your ZIP code..."
          className={inputClass}
        />

        <FieldError name="zip_code" errors={state?.fieldErrors} />
      </div>

      {/* Phone */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-phone`} className={labelClass}>
          Phone number
        </label>

        <input
          id={`${mode}-phone`}
          name="phone_number"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={profile?.phone_number ?? ""}
          placeholder="Enter your phone number..."
          className={inputClass}
        />

        <FieldError name="phone_number" errors={state?.fieldErrors} />
      </div>

      {/* Date of birth */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-dob`} className={labelClass}>
          Date of birth
        </label>

        <input
          id={`${mode}-dob`}
          name="date_of_birth"
          type="date"
          required
          defaultValue={profile?.date_of_birth?.slice(0, 10) ?? ""}
          className={inputClass}
        />

        <FieldError name="date_of_birth" errors={state?.fieldErrors} />
      </div>

      {/* Account type */}
      <div className="mb-4 sm:mb-5">
        <label htmlFor={`${mode}-role`} className={labelClass}>
          Account type
        </label>

        <select
          id={`${mode}-role`}
          name="role"
          required
          defaultValue={profile?.role ?? "buyer"}
          className={inputClass}
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>

        <FieldError name="role" errors={state?.fieldErrors} />
      </div>

      {/* Description */}
      <div className="mb-5 sm:mb-6">
        <label htmlFor={`${mode}-description`} className={labelClass}>
          About you (optional)
        </label>

        <textarea
          id={`${mode}-description`}
          name="description"
          maxLength={500}
          rows={3}
          defaultValue={profile?.description ?? ""}
          placeholder="Tell us a little about yourself..."
          className={inputClass}
        />

        <FieldError name="description" errors={state?.fieldErrors} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending || !!imageError}
        className="flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white shadow-lg transition-colors duration-300 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
      >
        {pending
          ? isEditing
            ? "Saving changes..."
            : "Creating account..."
          : isEditing
            ? "Save changes"
            : "Create account"}
      </button>

      {/* Login link: signup only */}
      {!isEditing && (
        <p className="mt-5 text-center text-sm leading-relaxed sm:text-base">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      )}
    </form>
  );
}

function FieldError({
  name,
  errors,
}: {
  name: string;
  errors?: Record<string, string[] | undefined>;
}) {
  const message = errors?.[name]?.[0];

  if (!message) return null;

  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}