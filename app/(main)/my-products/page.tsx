import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function MyArticlesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Please log in to see your articles.</p>;
  }

  const { data: articles, error } = await supabase
    .from("products")
    .select(
      `
      *,
      media (
        media_url,
        media_type
      )
    `,
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error);
    return <p>Could not load your articles.</p>;
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-bold">My Articles</h1>

      {!articles || articles.length === 0 ? (
        <p>You have not created any articles yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const imageUrl = article.media?.[0]?.media_url ?? null;

            return (
              <li
                key={article.id}
                className="overflow-hidden rounded-lg border p-4"
              >
                {imageUrl && (
                  <div className="relative mb-8 aspect-[4/3] w-full">
                    <Image
                      src={imageUrl}
                      alt={article.name}
                      fill
                      sizes="(max-width: 639px) 95vw, (max-width: 1023px) 48vw, 32vw"
                      className="object-contain transition-transform duration-500  hover:scale-105"
                    />
                  </div>
                )}

                <h2 className="font-semibold mb-5">{article.name}</h2>
                <hr />
                <p>{article.description}</p>

                <p className="mt-8 font-medium">Price: {article.price}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
