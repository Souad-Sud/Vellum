
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function sendConversationMessage(formData: FormData) {
  const supabase = await createClient();

  const sellerId = String(formData.get("sellerId") ?? "");
  const buyerId = String(formData.get("buyerId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (
    !sellerId ||
    !buyerId ||
    !productId ||
    !message ||
    message.length > 2000
  ) {
    throw new Error("Please enter a valid message.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Only the buyer or seller can participate.
  if (user.id !== sellerId && user.id !== buyerId) {
    throw new Error("You are not part of this conversation.");
  }

  // A user cannot message themselves.
  if (sellerId === buyerId) {
    throw new Error("You cannot message yourself.");
  }

  // Verify that the product belongs to this seller.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product || product.seller_id !== sellerId) {
    console.error("Product verification failed:", productError?.message);
    throw new Error("Invalid product.");
  }

  // Check whether this buyer/product conversation already exists.
  const { data: existingMessage, error: conversationError } =
    await supabase
      .from("seller_messages")
      .select("id, buyer_name")
      .eq("seller_id", sellerId)
      .eq("buyer_id", buyerId)
      .eq("product_id", productId)
      .limit(1)
      .maybeSingle();

  if (conversationError) {
    console.error(
      "Conversation lookup failed:",
      conversationError.message
    );
    throw new Error("Could not load the conversation.");
  }

  // Sellers may reply only to conversations already started by a buyer.
  if (!existingMessage && user.id === sellerId) {
    throw new Error(
      "This conversation does not exist yet. The buyer must message you first."
    );
  }

  // Get the buyer's profile to label the conversation's first message.
  const { data: buyerProfile, error: buyerProfileError } = await supabase
    .from("users")
    .select("username")
    .eq("id", buyerId)
    .maybeSingle();

  if (buyerProfileError || !buyerProfile) {
    console.error(
      "Buyer profile lookup failed:",
      buyerProfileError?.message
    );
    throw new Error("Could not find the buyer's profile.");
  }

  // Get the sender's username.
  const { data: senderProfile, error: senderProfileError } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (senderProfileError) {
    console.error(
      "Sender profile lookup failed:",
      senderProfileError.message
    );
    throw new Error("Could not load your profile.");
  }

  const senderName =
    senderProfile?.username?.trim() ||
    (user.id === sellerId ? "Seller" : "Buyer");

  const buyerName =
    existingMessage?.buyer_name ||
    buyerProfile.username?.trim() ||
    "Buyer";

  // Insert the message. This also starts a conversation
  // when the buyer sends the very first message.
  const { error: insertError } = await supabase
    .from("seller_messages")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      buyer_name: buyerName,
      sender_id: user.id,
      sender_name: senderName,
      message,
    });

  if (insertError) {
    console.error("Failed to send message:", {
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
    });

    throw new Error("Failed to send your message.");
  }

  redirect(
    `/contact/${sellerId}?productId=${encodeURIComponent(
      productId
    )}&buyerId=${encodeURIComponent(buyerId)}&sent=1`
  );
}
