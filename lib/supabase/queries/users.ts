
import { createClient } from "@/lib/supabase/server";

export async function getProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, username, address, zip_code, city, phone_number, date_of_birth, role, description, image_url_profile"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch profile:", error.message);
    throw new Error("Failed to fetch profile.");
  }

  return data;
}

export async function getPublicSellerProfile(sellerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seller_public_profiles")
    .select("id, username, role, description, image_url_profile")
    .eq("id", sellerId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch public seller profile:", error.message);
    throw new Error("Failed to fetch public seller profile.");
  }

  console.log("Public seller query result:", data);

  return data;
}
