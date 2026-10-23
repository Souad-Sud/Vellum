
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EditProfileState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export default async function editProfile(
  _prevState: EditProfileState,
  formData: FormData
): Promise<EditProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Please log in to edit your profile." };
  }

  const username = String(formData.get("username") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const zip_code = String(formData.get("zip_code") ?? "").trim();
  const phone_number = String(
    formData.get("phone_number") ?? ""
  ).trim();
  const date_of_birth = String(
    formData.get("date_of_birth") ?? ""
  ).trim();
  const role = String(formData.get("role") ?? "buyer");
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  if (username.length < 6) {
    return {
      fieldErrors: {
        username: ["Username must be at least 6 characters."],
      },
    };
  }

  if (
    !address ||
    !city ||
    !zip_code ||
    !phone_number ||
    !date_of_birth
  ) {
    return { error: "Please complete all required fields." };
  }

  if (!["buyer", "seller"].includes(role)) {
    return { error: "Please select a valid account type." };
  }

  if (description.length > 500) {
    return {
      fieldErrors: {
        description: ["Maximum 500 characters allowed."],
      },
    };
  }

  const { error } = await supabase
    .from("users")
    .update({
      username,
      address,
      city,
      zip_code,
      phone_number,
      date_of_birth,
      role,
      description: description || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update failed:", error.message);
    return {
      error: "Could not update your profile. Please try again.",
    };
  }

  revalidatePath("/profile");

  return { message: "Your profile was updated successfully." };
}
