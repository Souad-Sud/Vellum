
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SellerMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: messages, error } = await supabase
    .from("seller_messages")
    .select(
      "id, buyer_id, buyer_name, product_id, sender_id, sender_name, message, created_at, read_at"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load messages:", error.message);
  }

  // Keep only the latest message for each buyer/product conversation.
  const latestByConversation = new Map<
    string,
    NonNullable<typeof messages>[number]
  >();

  for (const item of messages ?? []) {
    const key = `${item.buyer_id}:${item.product_id}`;

    if (!latestByConversation.has(key)) {
      latestByConversation.set(key, item);
    }
  }

  const conversations = Array.from(latestByConversation.values());

  return (
    <main className="min-h-screen bg-[#faf8f4] px-4 py-12 text-neutral-800">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl">Messages</h1>
        <p className="mb-8 text-neutral-600">
          Your conversations with buyers.
        </p>

        {error ? (
          <p>Unable to load messages. Please try again.</p>
        ) : !conversations.length ? (
          <p className="border border-[#E8DED2] bg-white p-6">
            No messages yet.
          </p>
        ) : (
          <div className="space-y-4">
            {conversations.map((item) => {
              const isUnread =
                item.sender_id !== user.id && item.read_at === null;

              const senderLabel =
                item.sender_id === user.id
                  ? "You"
                  : item.sender_name || item.buyer_name || "Buyer";

              return (
                <Link
                  key={`${item.buyer_id}-${item.product_id}`}
                  href={`/contact/${user.id}?productId=${encodeURIComponent(
                    item.product_id
                  )}&buyerId=${encodeURIComponent(item.buyer_id)}`}
                  className={`block border bg-white p-7 hover:bg-[#f5f0e8] ${
                    isUnread
                      ? "border-[#8B5E4A]"
                      : "border-[#E8DED2]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {item.buyer_name || "Buyer"}
                    </p>

                    {isUnread && (
                      <span className="shrink-0 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-neutral-500">
                    {senderLabel}:
                  </p>

                  <p className="mt-1 whitespace-pre-wrap break-words text-2xl">
                    {item.message}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  <p className="mt-3 text-sm underline">
                    View conversation →
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
