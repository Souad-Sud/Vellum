
import { createClient } from "../server";

export const getHomeArticles = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      slug,
      description,
      seller_id,
      media (
        id,
        media_url,
        media_type
      )
    `);

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  const shuffledProducts = [...(data ?? [])].sort(
    () => Math.random() - 0.5
  );

  return {
    data: shuffledProducts,
    error: null,
  };
};

export const getSingleArticle = async (slug: string) => {
  const supabase = await createClient();

  return await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      slug,
      seller_id,
      media (
        id,
        media_url,
        media_type
      )
    `)
    .eq("slug", slug)
    .maybeSingle();
};

export type HomeArticlesType = NonNullable<
  Awaited<ReturnType<typeof getHomeArticles>>["data"]
>;

export type GetSingleArticlesType = NonNullable<
  Awaited<ReturnType<typeof getSingleArticle>>["data"]
>;
