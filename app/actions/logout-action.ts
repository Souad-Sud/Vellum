
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error.message);
    throw new Error("Unable to log out. Please try again.");
  }

  redirect("/");
}
