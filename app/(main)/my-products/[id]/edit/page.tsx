
import EditProductForm from "@/components/Products/EditeProductForm";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, description, price")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">
        Edit Product
      </h1>

      <EditProductForm product={product} />
    </main>
  );
}
