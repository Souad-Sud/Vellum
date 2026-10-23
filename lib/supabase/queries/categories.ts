import { createClient } from "../client";

export const getCategories = async () => {
const supabase = createClient();

const { data, error } = await supabase
.from("category")
.select("id, name, slug")
.order("name");

if (error) {
return {
data: null,
error: error.message,
};
}

return {
data,
error: null,
};
};

export const getSingleCategory = async (slug: string) => {
const supabase = createClient();

// Find the category using its slug
const { data: category, error } = await supabase
.from("category")
.select("id, name, slug")
.eq("slug", slug)
.single();

if (error) {
return {
data: null,
error: error.message,
};
}

// Fetch products belonging to this category
const { data: products, error: productsError } = await supabase
.from("products")
.select(`       id,
      name,
      price,
      slug,
      media (id, media_url, media_type)
    `)
.eq("category_id", category.id);

if (productsError) {
return {
data: null,
error: productsError.message,
};
}

return {
data: {
category,
products: products ?? [],
},
error: null,
};
};

export type CategoriesType = NonNullable<
Awaited<ReturnType<typeof getCategories>>["data"]> ;
