import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BuyerMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Load messages belonging to this buyer
  const { data: messages, error } = await supabase
    .from("seller_messages")
    .select(
      "id, seller_id, buyer_id, product_id, sender_id, sender_name, message, created_at, read_at",
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load buyer messages:", error.message);
  }

  // Keep the latest message for each seller/product conversation
  type Message = NonNullable<typeof messages>[number];

  const latestByConversation = new Map<string, Message>();

  for (const item of messages ?? []) {
    const key = `${item.seller_id}:${item.product_id}`;

    if (!latestByConversation.has(key)) {
      latestByConversation.set(key, item);
    }
  }

  const conversations = Array.from(latestByConversation.values());

  return (
    <main className="min-h-screen bg-[#faf8f4] px-4 py-12 text-neutral-800">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-semibold">My messages</h1>

        <p className="mb-8 text-neutral-600">
          Your conversations with sellers.
        </p>

        {error ? (
          <p className="border border-red-200 bg-white p-6">
            Unable to load messages. Please try again.
          </p>
        ) : conversations.length === 0 ? (
          <p className="border border-[#E8DED2] bg-white p-6">
            You have no messages yet.
          </p>
        ) : (
          <div className="space-y-4">
            {conversations.map((item) => {
              const isUnread =
                item.sender_id !== user.id && item.read_at === null;

              return (
                <Link
                  key={`${item.seller_id}-${item.product_id}`}
                  href={`/contact/${item.seller_id}?productId=${encodeURIComponent(
                    item.product_id,
                  )}&buyerId=${encodeURIComponent(user.id)}`}
                  className={`block border bg-white p-7 transition hover:bg-[#f5f0e8] ${
                    isUnread ? "border-[#8B5E4A]" : "border-[#E8DED2]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">
                      {item.sender_id === user.id
                        ? "Your message"
                        : item.sender_name || "Seller"}
                    </p>

                    {isUnread && (
                      <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 break-words text-2xl text-neutral-700">
                    {item.message}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  <p className="mt-3 text-sm underline">Open conversation →</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
