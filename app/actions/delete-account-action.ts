
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export type DeleteAccountState = {
  error?: string;
} | null;

export default async function deleteAccountAction(
  _prevState: DeleteAccountState,
  _formData: FormData
): Promise<DeleteAccountState> {
  // Verify the currently authenticated user.
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to delete your account." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase admin environment variables are missing.");
    return { error: "Account deletion is temporarily unavailable." };
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Remove this user's profile pictures from Storage.
  const bucket = admin.storage.from("profile-images");
  const { data: files, error: listError } = await bucket.list(user.id);

  if (listError) {
    console.error("Could not list profile images:", listError.message);
    return { error: "Could not remove your profile pictures. Please try again." };
  }

  if (files && files.length > 0) {
    const paths = files
      .filter((file) => file.id)
      .map((file) => `${user.id}/${file.name}`);

    if (paths.length > 0) {
      const { error: storageError } = await bucket.remove(paths);

      if (storageError) {
        console.error("Could not remove profile images:", storageError.message);
        return { error: "Could not remove your profile pictures. Please try again." };
      }
    }
  }

  // Delete the public profile row.
  const { error: profileError } = await admin
    .from("users")
    .delete()
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile deletion failed:", profileError.message);
    return { error: "Could not delete your profile. Please try again." };
  }

  // Delete the Supabase Auth account.
  const { error: deleteError } =
    await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Auth account deletion failed:", deleteError.message);
    return {
      error:
        "Your profile was removed, but your login account could not be deleted. Please contact support.",
    };
  }

  // End the current session and return to the home page.
  await supabase.auth.signOut();

  redirect("/");
}
