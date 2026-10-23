
import { createClient } from "./client";

const PRODUCT_IMAGES_BUCKET = "products";
const PROFILE_IMAGES_BUCKET = "profile-images";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

async function uploadImage(
  file: File,
  bucket: string
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to upload an image.");
  }

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Upload product photos to the product-images bucket.
export async function uploadProductImage(
  file: File
): Promise<string> {
  return uploadImage(file, PRODUCT_IMAGES_BUCKET);
}

// Upload profile pictures to the profile-images bucket.
export async function uploadProfileImage(
  file: File
): Promise<string> {
  return uploadImage(file, PROFILE_IMAGES_BUCKET);
}
