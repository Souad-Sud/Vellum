
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { signUpSchema } from "@/app/actions/schemas";

export type SignUpState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

const BUCKET_NAME = "profile-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default async function SignUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const imageValue = formData.get("profile_image");

  const imageFile =
    imageValue instanceof File && imageValue.size > 0
      ? imageValue
      : null;

  // Validate the optional image on the server.
  if (imageFile) {
    if (!ALLOWED_TYPES[imageFile.type]) {
      return {
        error: "Please choose a JPG, PNG, or WebP profile picture.",
      };
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return {
        error: "The profile picture must be 5 MB or smaller.",
      };
    }
  }

  const result = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    address: formData.get("address"),
    zip_code: formData.get("zip_code"),
    description: formData.get("description") || undefined,
    date_of_birth: formData.get("date_of_birth"),
    role: formData.get("role"),
    city: formData.get("city"),
    phone_number: formData.get("phone_number"),
    image_url_profile: null,
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const {
    email,
    password,
    username,
    address,
    zip_code,
    description,
    date_of_birth,
    role,
    city,
    phone_number,
  } = result.data;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        address,
        zip_code,
        description: description || null,
        date_of_birth,
        role,
        city,
        phone_number,
        image_url_profile: null,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);

    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Supabase did not return a user." };
  }

  // The database trigger creates the public.users profile.
  // Use a server-only service role client for the optional image upload,
  // including when email confirmation is required.
  if (imageFile) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase server environment variables are missing.");

      return {
        error:
          "Your account was created, but the profile picture could not be saved. Please contact support.",
      };
    }

    const admin = createSupabaseClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const extension = ALLOWED_TYPES[imageFile.type];
    const imagePath =
      `${data.user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(imagePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Profile image upload failed:", uploadError.message);

      return {
        error:
          "Your account was created, but the profile picture upload failed. Please check your Storage bucket configuration.",
      };
    }

    const imageUrl = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(imagePath).data.publicUrl;

    const { error: updateError } = await admin
      .from("users")
      .update({ image_url_profile: imageUrl })
      .eq("id", data.user.id);

    if (updateError) {
      console.error("Profile image URL update failed:", updateError.message);

      // Clean up the uploaded image if saving its URL failed.
      const { error: cleanupError } = await admin.storage
        .from(BUCKET_NAME)
        .remove([imagePath]);

      if (cleanupError) {
        console.error("Image cleanup failed:", cleanupError.message);
      }

      return {
        error:
          "Your account was created, but the profile picture URL could not be saved.",
      };
    }
  }

  if (!data.session) {
    return {
      message:
        "Your account was created. Please confirm your email before logging in.",
    };
  }

  redirect("/profile");
}
