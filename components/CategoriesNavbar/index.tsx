import { getCategories } from "@/lib/supabase/queries/categories";
import CategoryLinks from "../CategoryLinks";

export default async function CategoriesNavbar() {
  const { data: categories, error } = await getCategories();

  if (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <nav className="w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:px-8 lg:px-10">
        <CategoryLinks categories={categories ?? []} />
      </div>
    </nav>
  );
}