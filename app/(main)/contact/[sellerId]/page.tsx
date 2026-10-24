import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicSellerProfile } from "@/lib/supabase/queries/users";
import { sendConversationMessage } from "../actions";
import RefreshOnMount from "../RefreshOnMount";
export default async function ContactSellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ sellerId: string }>;
  searchParams: Promise<{
    productId?: string;
    buyerId?: string;
    sent?: string;
  }>;
}) {
  const { sellerId } = await params;
  const { productId, buyerId, sent } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isSeller = user.id === sellerId;

  // Sellers must select a specific buyer.
  if (isSeller && productId && !buyerId) {
    redirect("/seller/messages");
  }

  // Buyers may only access their own conversations.
  if (!isSeller && buyerId && buyerId !== user.id) {
    notFound();
  }

  const seller = await getPublicSellerProfile(sellerId);

  if (!seller) {
    notFound();
  }

  let productName = "the seller";
  let productSlug: string | null = null;

  if (productId) {
    const { data: product, error } = await supabase
      .from("products")
      .select("name, slug, seller_id")
      .eq("id", productId)
      .maybeSingle();

    if (error || !product || product.seller_id !== sellerId) {
      notFound();
    }

    productName = product.name;
    productSlug = product.slug;
  }

  type Message = {
    id: string;
    buyer_id: string;
    buyer_name: string;
    sender_id: string | null;
    sender_name: string | null;
    message: string;
    created_at: string;
  };

  let messages: Message[] = [];

  if (productId) {
    let query = supabase
      .from("seller_messages")
      .select(
        "id, buyer_id, buyer_name, sender_id, sender_name, message, created_at",
      )
      .eq("seller_id", sellerId)
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (isSeller) {
      const result = await query.eq("buyer_id", buyerId!);

      if (result.error) {
        console.error("Failed to load messages:", result.error.message);
      } else {
        messages = (result.data ?? []) as Message[];
      }
    } else {
      const result = await query.eq("buyer_id", user.id);

      if (result.error) {
        console.error("Failed to load messages:", result.error.message);
      } else {
        messages = (result.data ?? []) as Message[];
      }
    }

    // Mark incoming messages as read.
    // Only run after loading the selected conversation.
    if (messages.length > 0) {
      const conversationBuyerId = isSeller ? buyerId! : user.id;

      const { error: readError } = await supabase
        .from("seller_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("seller_id", sellerId)
        .eq("buyer_id", conversationBuyerId)
        .eq("product_id", productId)
        .neq("sender_id", user.id)
        .is("read_at", null);

      if (readError) {
        console.error("Failed to mark messages as read:", readError.message);
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] px-4 py-12 text-neutral-800 sm:px-6">
      <RefreshOnMount />
      <div className="mx-auto max-w-2xl">
        <Link
          href={
            isSeller
              ? "/seller/messages"
              : productId && productSlug
                ? `/articles/${productSlug}`
                : "/homepage"
          }
          className="mb-6 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Back
        </Link>

        <div className="mt-8 border border-[#E8DED2] bg-white p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            {isSeller ? "Buyer conversation" : "Your conversation"}
          </p>

          <h1 className="mt-3 text-3xl">
            {isSeller
              ? `Conversation with ${messages[0]?.buyer_name || "buyer"}`
              : `Contact ${seller.username || "seller"}`}
          </h1>

          <p className="mt-3 text-neutral-600">
            About <span className="font-medium">{productName}</span>
          </p>

          {sent === "1" && (
            <div className="mt-6 border border-green-200 bg-green-50 p-4 text-green-800">
              Your message has been sent successfully!
            </div>
          )}

          <section className="mt-8">
            {messages.length === 0 ? (
              <p className="border border-[#E8DED2] bg-[#faf8f4] p-5 text-sm text-neutral-600">
                No messages found in this conversation.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((item) => {
                  const isMine = item.sender_id
                    ? item.sender_id === user.id
                    : item.buyer_id === user.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          isMine
                            ? "bg-neutral-800 text-white"
                            : "border border-[#E8DED2] bg-[#faf8f4] text-neutral-800"
                        }`}
                      >
                        <p className="mb-1 text-xs opacity-70">
                          {isMine
                            ? "You"
                            : item.sender_name || item.buyer_name || "Buyer"}
                        </p>

                        <p className="whitespace-pre-wrap break-words text-sm">
                          {item.message}
                        </p>

                        <p className="mt-2 text-right text-xs opacity-60">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {productId && (!isSeller || buyerId) && (
            <form action={sendConversationMessage} className="mt-8 space-y-5">
              <input type="hidden" name="sellerId" value={sellerId} />

              <input
                type="hidden"
                name="buyerId"
                value={isSeller ? buyerId || "" : user.id}
              />

              <input type="hidden" name="productId" value={productId} />

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium"
                >
                  Write a reply
                </label>

                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={1}
                  maxLength={2000}
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full resize-y border border-[#D8CFC3] bg-[#faf8f4] p-4 outline-none focus:border-neutral-800"
                />

                <p className="mt-2 text-sm text-neutral-500">
                  Maximum 2,000 characters.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center bg-neutral-800 px-8 py-3 text-sm uppercase tracking-[0.15em] text-white transition hover:bg-neutral-700"
              >
                Send reply
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
