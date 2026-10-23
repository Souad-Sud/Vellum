import { getHomeArticles } from "@/lib/supabase/queries/articles";
import ErrorMessage from "@/components/ErrorMessage";
import { HomeArticles } from "@/components/HomeArticles";

export default async function HomePage() {
  const { data, error } = await getHomeArticles();

  const pageTitle = (
    <h1 className="mb-6 px-3 text-3xl font-bold leading-tight sm:mb-8 sm:px-5 sm:text-4xl md:text-5xl lg:mb-10">
      Always something new ...
    </h1>
  );

  if (error) {
    return (
      <main className="min-h-screen w-full min-w-0 font-cormorant">
        <section className="w-full pt-12 sm:pt-16 md:pt-20 lg:pt-24">
          {pageTitle}
          <div className="px-3 sm:px-5">
            <ErrorMessage message={error} />
          </div>
        </section>
      </main>
    );
  }

  const articles = data ?? [];

  return (
    <main className="min-h-screen w-full min-w-0 font-cormorant">
      <section className="w-full pt-12 sm:pt-16 md:pt-20 lg:pt-24">
        {pageTitle}

        {articles.length === 0 ? (
          <p className="px-3 text-base sm:px-5 sm:text-lg">
            No products available.
          </p>
        ) : (
          <div className="w-full min-w-0 px-2 sm:px-3 lg:px-4">
            <HomeArticles articles={articles} />
          </div>
        )}
      </section>
    </main>
  );
}