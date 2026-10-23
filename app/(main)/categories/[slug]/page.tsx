import Link from "next/link";
import Image from "next/image";
import ErrorMessage from "@/components/ErrorMessage";
import { getSingleCategory } from "@/lib/supabase/queries/categories";

export default async function SingleCategories({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await getSingleCategory(slug);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!data) {
    return <ErrorMessage message="Category not found" />;
  }

  return (
    <main className="p-10">
      <h1 className="mb-10 text-4xl font-semibold">{data.category.name}</h1>

      <div className="flex flex-wrap justify-center gap-6">
        {data.products.map((product) => {
          const imageUrl = product.media?.[0]?.media_url ?? null;

          return (
            <article
              key={product.id}
              className="flex w-[350px] flex-col overflow-hidden rounded-lg bg-articles-bg shadow-md"
            >
              <div className="flex flex-col items-center gap-3 p-5">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={400}
                    height={550}
                  />
                )}

                <h2 className="text-xl font-semibold">{product.name}</h2>

                <p className="text-lg">{Number(product.price).toFixed(2)} kr</p>

                <Link
                  href={`/articles/${product.slug}`}
                  className="rounded-md bg-black px-5 py-2 text-white"
                >
                  View product
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
