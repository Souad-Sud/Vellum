
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
} | null;

export default async function Login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Check your Next.js terminal for this message.
    console.error("Supabase login error:", error.message);

    // Temporarily display the real error while debugging.
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed: no user was returned." };
  }

  redirect("/profile");
}
