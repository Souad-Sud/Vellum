
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

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default async function SignUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const imageValue = formData.get("profile_image");

  const imageFile =
    imageValue instanceof File && imageValue.size > 0
      ? imageValue
      : null;

  if (imageFile) {
    if (!ALLOWED_TYPES[imageFile.type]) {
      return { error: "Please choose a JPG, PNG, or WebP profile picture." };
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return { error: "The profile picture must be 5 MB or smaller." };
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing server-side Supabase environment variables.");
    return {
      error:
        "Your account was created, but profile verification could not run. Please contact support.",
    };
  }

  const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let imageUrl: string | null = null;
  let imagePath: string | null = null;

  // Upload the optional profile image.
  if (imageFile) {
    const extension = ALLOWED_TYPES[imageFile.type];
    imagePath = `${data.user.id}/${crypto.randomUUID()}.${extension}`;

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

    imageUrl = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(imagePath).data.publicUrl;
  }

  // Read and verify every expected main-profile field.
  const expectedProfile = {
    email: data.user.email ?? email,
    username,
    address,
    zip_code,
    description: description || null,
    date_of_birth,
    role,
    city,
    phone_number,
  };

  type UserProfile = {
    id: string;
    email: string | null;
    username: string | null;
    address: string | null;
    zip_code: string | null;
    description: string | null;
    date_of_birth: string | null;
    role: string | null;
    city: string | null;
    phone_number: string | null;
    image_url_profile: string | null;
  };

  let userProfile: UserProfile | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: profile, error: profileError } = await admin
      .from("users")
      .select(
        "id, email, username, address, zip_code, description, date_of_birth, role, city, phone_number, image_url_profile"
      )
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("User profile lookup failed:", profileError.message);
      return {
        error:
          "Your account was created, but its profile could not be verified. Please contact support.",
      };
    }

    if (profile) {
      userProfile = profile as UserProfile;
      break;
    }

    await sleep(300);
  }

  if (!userProfile) {
    console.error("Missing public.users profile:", data.user.id);
    return {
      error:
        "Your account was created, but its database profile was not found. Please contact support.",
    };
  }

  const mismatches = Object.entries(expectedProfile)
    .filter(([key, expected]) => {
      const actual = userProfile![key as keyof typeof expectedProfile];
      return actual !== expected;
    })
    .map(([key, expected]) => ({
      field: key,
      expected,
      actual: userProfile![key as keyof typeof expectedProfile],
    }));

  if (mismatches.length > 0) {
    // Avoid logging personal values such as address, phone, or birth date.
    console.error(
      "Profile verification failed for fields:",
      mismatches.map((item) => item.field)
    );

    return {
      error:
        "Your account was created, but some profile information was not saved correctly. Please contact support.",
    };
  }

  // Save and verify the profile image URL, if an image was uploaded.
  if (imageUrl) {
    const { data: updatedUser, error: updateError } = await admin
      .from("users")
      .update({ image_url_profile: imageUrl })
      .eq("id", data.user.id)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedUser) {
      console.error(
        "Profile image URL update failed:",
        updateError?.message ?? "No user row updated."
      );
      return {
        error:
          "Your account was created, but the profile picture URL could not be saved.",
      };
    }

    const { data: verifiedImage, error: imageVerifyError } = await admin
      .from("users")
      .select("image_url_profile")
      .eq("id", data.user.id)
      .maybeSingle();

    if (
      imageVerifyError ||
      verifiedImage?.image_url_profile !== imageUrl
    ) {
      console.error("Profile image URL verification failed.");
      return {
        error:
          "Your account was created, but the profile picture could not be verified.",
      };
    }

    userProfile.image_url_profile = imageUrl;
  }

  // Create and verify the public profile for sellers only.
  if (userProfile.role === "seller") {
    const expectedSellerProfile = {
      id: userProfile.id,
      username: userProfile.username,
      role: userProfile.role,
      description: userProfile.description,
      image_url_profile: userProfile.image_url_profile,
    };

    const { error: sellerUpsertError } = await admin
      .from("seller_public_profiles")
      .upsert(expectedSellerProfile, { onConflict: "id" });

    if (sellerUpsertError) {
      console.error(
        "Seller profile save failed:",
        sellerUpsertError.message
      );
      return {
        error:
          "Your account was created, but your public seller profile could not be saved.",
      };
    }

    const { data: savedSeller, error: sellerVerifyError } = await admin
      .from("seller_public_profiles")
      .select("id, username, role, description, image_url_profile")
      .eq("id", userProfile.id)
      .maybeSingle();

    if (sellerVerifyError || !savedSeller) {
      console.error(
        "Seller profile verification failed:",
        sellerVerifyError?.message ?? "No seller profile found."
      );
      return {
        error:
          "Your account was created, but your public seller profile could not be verified.",
      };
    }

    const sellerMismatches = Object.entries(expectedSellerProfile).filter(
      ([key, expected]) =>
        savedSeller[key as keyof typeof expectedSellerProfile] !== expected
    );

    if (sellerMismatches.length > 0) {
      console.error(
        "Seller profile fields not saved correctly:",
        sellerMismatches.map(([key]) => key)
      );

      return {
        error:
          "Your account was created, but some seller profile information was not saved correctly.",
      };
    }
  }

  // Email confirmation may be required before a session is created.
  if (!data.session) {
    return {
      message:
        "Your account was created. Please confirm your email before logging in.",
    };
  }

  redirect("/profile");
}
