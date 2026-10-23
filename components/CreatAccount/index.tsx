"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import SignUp from "@/app/actions/signup-action";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function CreateAccount() {
  const [state, formAction, pending] = useActionState(SignUp, null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const inputClass =
    "block w-full min-w-0 rounded-lg border border-gray-300 bg-input px-3 py-3 text-base outline-none transition-colors duration-300 placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 sm:px-4";

  const labelClass = "mb-2 block text-sm font-semibold";

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setImageError(null);

    if (!file) {
      setImagePreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      setImagePreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError("Your image must be 5 MB or smaller.");
      event.target.value = "";
      setImagePreview(null);
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col justify-center">
      <div className="mb-4 rounded-lg border border-transparent p-[2px] transition-colors duration-300 hover:border-amber-50 hover:shadow-lg sm:mb-6">
        <button
          type="button"
          aria-expanded={showForm}
          onClick={() => setShowForm((prev) => !prev)}
          className="w-full cursor-pointer rounded-[6px] border border-gray-300 bg-whitesmoke px-4 py-3 text-center text-sm font-medium text-black transition-colors duration-300 hover:border-transparent sm:px-6 sm:text-base"
        >
          {showForm ? "Hide signup form" : "Create an account"}
        </button>
      </div>

      <div
        className={`grid min-w-0 transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
          showForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!showForm}
      >
        <div className="min-h-0 min-w-0 overflow-hidden">
          <form
            action={formAction}
            className="mb-6 w-full min-w-0 rounded-xl bg-cream p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8"
          >
            <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">
              Create your account
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
              <label htmlFor="signup-profile-image" className={labelClass}>
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
                id="signup-profile-image"
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
              <label htmlFor="signup-username" className={labelClass}>
                Username
              </label>
              <input
                id="signup-username"
                name="username"
                required
                minLength={6}
                autoComplete="username"
                placeholder="Choose a username..."
                className={inputClass}
              />
              <FieldError name="username" errors={state?.fieldErrors} />
            </div>

            {/* Email */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-email" className={labelClass}>
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email..."
                className={inputClass}
              />
              <FieldError name="email" errors={state?.fieldErrors} />
            </div>

            {/* Password */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-password" className={labelClass}>
                Password
              </label>
              <input
                id="signup-password"
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

            {/* Address */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-address" className={labelClass}>
                Address
              </label>
              <input
                id="signup-address"
                name="address"
                required
                autoComplete="street-address"
                placeholder="Enter your address..."
                className={inputClass}
              />
              <FieldError name="address" errors={state?.fieldErrors} />
            </div>

            {/* City */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-city" className={labelClass}>
                City
              </label>
              <input
                id="signup-city"
                name="city"
                required
                autoComplete="address-level2"
                placeholder="Enter your city..."
                className={inputClass}
              />
              <FieldError name="city" errors={state?.fieldErrors} />
            </div>

            {/* ZIP code */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-zip" className={labelClass}>
                ZIP code
              </label>
              <input
                id="signup-zip"
                name="zip_code"
                required
                autoComplete="postal-code"
                placeholder="Enter your ZIP code..."
                className={inputClass}
              />
              <FieldError name="zip_code" errors={state?.fieldErrors} />
            </div>

            {/* Phone */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-phone" className={labelClass}>
                Phone number
              </label>
              <input
                id="signup-phone"
                name="phone_number"
                type="tel"
                required
                autoComplete="tel"
                placeholder="Enter your phone number..."
                className={inputClass}
              />
              <FieldError name="phone_number" errors={state?.fieldErrors} />
            </div>

            {/* Date of birth */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-dob" className={labelClass}>
                Date of birth
              </label>
              <input
                id="signup-dob"
                name="date_of_birth"
                type="date"
                required
                className={inputClass}
              />
              <FieldError name="date_of_birth" errors={state?.fieldErrors} />
            </div>

            {/* Account type */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="signup-role" className={labelClass}>
                Account type
              </label>
              <select
                id="signup-role"
                name="role"
                required
                defaultValue="buyer"
                className={inputClass}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              <FieldError name="role" errors={state?.fieldErrors} />
            </div>

            {/* Description */}
            <div className="mb-5 sm:mb-6">
              <label htmlFor="signup-description" className={labelClass}>
                About you (optional)
              </label>
              <textarea
                id="signup-description"
                name="description"
                maxLength={500}
                rows={3}
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
              {pending ? "Creating account..." : "Create account"}
            </button>

            <p className="mt-5 text-center text-sm leading-relaxed sm:text-base">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
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

export default CreateAccount;
