"use client";
import Link from "next/link";
import type { ProfileFormProps } from "@/types/profile";
import ProfileImageField from "../ProfileImageField";
import ProfileInputField from "../ProfileInputField";
import ProfileSubmitButton from "../ProfileSubmittedButton";

export default function ProfileForm({
  mode,
  profile,
  state,
  formAction,
  pending,
}: ProfileFormProps) {
  const isEditing = mode === "edit";

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
<ProfileImageField
  mode={mode}
  initialImage={profile?.image_url_profile}
/>

{state?.fieldErrors?.profile_image && (
  <p role="alert" className="mb-4 text-sm text-red-600">
    {state.fieldErrors.profile_image[0]}
  </p>
)}

      <ProfileInputField
        label="Username"
        name="username"
        errors={state?.fieldErrors?.username}
        required
        minLength={6}
        autoComplete="username"
        defaultValue={profile?.username ?? ""}
        placeholder="Choose a username..."
      />

      {!isEditing && (
        <>
          <ProfileInputField
            label="Email"
            name="email"
            type="email"
            errors={state?.fieldErrors?.email}
            required
            autoComplete="email"
            placeholder="Enter your email..."
          />
          <ProfileInputField
            label="Password"
            name="password"
            type="password"
            errors={state?.fieldErrors?.password}
            required
            minLength={5}
            autoComplete="new-password"
            placeholder="Create a password..."
          />
        </>
      )}
      <ProfileInputField
        label="Address"
        name="address"
        errors={state?.fieldErrors?.address}
        required
        autoComplete="street-address"
        defaultValue={profile?.address ?? ""}
        placeholder="Enter your address..."
      />
      <ProfileInputField
        label="City"
        name="city"
        errors={state?.fieldErrors?.city}
        required
        autoComplete="address-level2"
        defaultValue={profile?.city ?? ""}
        placeholder="Enter your city..."
      />
      <ProfileInputField
        label="ZIP code"
        name="zip_code"
        errors={state?.fieldErrors?.zip_code}
        required
        autoComplete="postal-code"
        defaultValue={profile?.zip_code ?? ""}
        placeholder="Enter your ZIP code..."
      />
      <ProfileInputField
        label="Phone number"
        name="phone_number"
        type="tel"
        errors={state?.fieldErrors?.phone_number}
        required
        autoComplete="tel"
        defaultValue={profile?.phone_number ?? ""}
        placeholder="Enter your phone number..."
      />
      <ProfileInputField
        label="Date of birth"
        name="date_of_birth"
        type="date"
        errors={state?.fieldErrors?.date_of_birth}
        required
        defaultValue={profile?.date_of_birth?.slice(0, 10) ?? ""}
      />
      <ProfileSubmitButton mode={mode} pending={pending} />
    </form>
  );
}
