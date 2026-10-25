
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EditProfileState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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
  const phone_number = String(formData.get("phone_number") ?? "").trim();
  const date_of_birth = String(formData.get("date_of_birth") ?? "").trim();

  const fieldErrors: Record<string, string[]> = {};

  if (username.length < 6) {
    fieldErrors.username = [
      "Username must be at least 6 characters.",
    ];
  }
  if (!address) fieldErrors.address = ["Address is required."];
  if (!city) fieldErrors.city = ["City is required."];
  if (!zip_code) fieldErrors.zip_code = ["ZIP code is required."];
  if (!phone_number) {
    fieldErrors.phone_number = ["Phone number is required."];
  }
  if (!date_of_birth) {
    fieldErrors.date_of_birth = ["Date of birth is required."];
  }

  const imageEntry = formData.get("profile_image");
  const image =
    imageEntry instanceof File && imageEntry.size > 0
      ? imageEntry
      : null;

  if (image) {
    if (!ALLOWED_IMAGE_TYPES[image.type]) {
      fieldErrors.profile_image = [
        "Please upload a JPG, PNG, or WebP image.",
      ];
    } else if (image.size > MAX_IMAGE_SIZE) {
      fieldErrors.profile_image = [
        "The image must be 5 MB or smaller.",
      ];
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let imagePath: string | null = null;
  let imageUrl: string | null = null;

  if (image) {
    const extension = ALLOWED_IMAGE_TYPES[image.type];
    imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(imagePath, image, {
        contentType: image.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Profile image upload failed:", uploadError.message);
      return {
        error:
          "Could not upload your profile picture. Please try again.",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("profile-images")
      .getPublicUrl(imagePath);

    imageUrl = publicUrl;
  }

  const updates: {
    username: string;
    address: string;
    city: string;
    zip_code: string;
    phone_number: string;
    date_of_birth: string;
    image_url_profile?: string;
  } = {
    username,
    address,
    city,
    zip_code,
    phone_number,
    date_of_birth,
  };

  if (imageUrl) {
    updates.image_url_profile = imageUrl;
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updatedProfile) {
    console.error(
      "Profile update failed:",
      updateError?.message ?? "No profile row was updated."
    );

    // Clean up the newly uploaded file if saving the profile failed.
    if (imagePath) {
      const { error: cleanupError } = await supabase.storage
        .from("profile-images")
        .remove([imagePath]);

      if (cleanupError) {
        console.error(
          "Could not clean up uploaded image:",
          cleanupError.message
        );
      }
    }

    return {
      error: updateError
        ? "Could not update your profile. Please try again."
        : "No profile was updated. Check that your profile exists and you have permission to edit it.",
    };
  }

  revalidatePath("/profile");

  return { message: "Your profile was updated successfully." };
}
