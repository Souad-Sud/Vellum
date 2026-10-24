import { getSingleArticle } from "@/lib/supabase/queries/articles";
import { getPublicSellerProfile } from "@/lib/supabase/queries/users";
import ErrorMessage from "@/components/ErrorMessage";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProfileIdentity from "@/components/Profile/ProfileIdentity";

export default async function SingleArticles({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getSingleArticle(slug);

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <ErrorMessage
          message={typeof error === "string" ? error : error.message}
        />
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  // Fetch the seller's public profile.
  const sellerProfile = data.seller_id
    ? await getPublicSellerProfile(data.seller_id)
    : null;

  console.log("Public seller profile:", sellerProfile);

  // Use only the public fields returned by the query.
  const sellerName = sellerProfile?.username?.trim() || "Seller";
  const sellerRole = sellerProfile?.role?.trim() || "Seller";

  const imageUrl =
    data.media?.find(
      (media) =>
        media.media_type?.toLowerCase() === "image" && Boolean(media.media_url),
    )?.media_url ??
    data.media?.find((media) => Boolean(media.media_url))?.media_url;

  const price = data.price == null ? null : Number(data.price);

  return (
    <main className="min-h-screen bg-[#faf8f4] font-cormorant text-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-10">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-neutral-500"
        >
          <Link
            href="/homepage"
            className="text-xl transition hover:text-neutral-900"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-xl text-neutral-800">{data.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pb-16 sm:px-6 sm:pb-20 md:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:pb-24">
        {/* Product image */}
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#f0ece5] sm:min-h-[450px] md:min-h-[540px] lg:min-h-[620px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={data.name}
              width={900}
              height={1000}
              priority
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="h-full max-h-[700px] w-full object-contain p-4 transition-transform duration-700 hover:scale-[1.03] sm:p-8"
            />
          ) : (
            <div className="flex min-h-[320px] w-full items-center justify-center px-6 text-center sm:min-h-[450px]">
              <p className="text-lg text-neutral-500">
                No image available for this product.
              </p>
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="flex flex-col items-start py-2 sm:py-6 lg:py-12">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-neutral-500 sm:text-sm">
            Discover the collection
          </p>

          <h1 className="max-w-xl text-4xl font-medium leading-tight tracking-wide sm:text-5xl md:text-6xl">
            {data.name}
          </h1>

          {price !== null && Number.isFinite(price) && (
            <p className="mt-5 text-2xl sm:text-3xl">{price.toFixed(2)} kr</p>
          )}

          <div className="my-7 h-px w-16 bg-neutral-400 sm:my-8" />

          {data.description ? (
            <p className="max-w-xl whitespace-pre-line text-lg leading-relaxed text-neutral-600 sm:text-xl sm:leading-9">
              {data.description}
            </p>
          ) : (
            <p className="text-lg text-neutral-500">
              More details about this product will be available soon.
            </p>
          )}

          <Link
            href="/homepage"
            className="mt-8 inline-flex min-h-12 items-center justify-center border border-neutral-800 px-8 py-3 text-center text-sm uppercase tracking-[0.15em] transition-colors duration-300 hover:bg-neutral-800 hover:text-white sm:mt-10"
          >
            Discover more
          </Link>

          <p className="mt-6 text-sm tracking-wide text-neutral-500">
            Thoughtfully chosen. Beautifully presented.
          </p>

          {/* Seller profile */}
          <section className="mt-10 w-full border-t border-[#E8DED2] pt-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
              About the seller
            </p>

            {sellerProfile ? (
              <>
                <ProfileIdentity
                  displayName={sellerName}
                  role={sellerRole}
                  imageUrl={sellerProfile.image_url_profile}
                />

                {data.seller_id && (
                  <Link
                    href={`/contact/${data.seller_id}?productId=${data.id}`}
                    className="mt-5 inline-flex min-h-12 items-center justify-center border border-neutral-800 px-6 py-3 text-sm uppercase tracking-[0.12em] transition-colors hover:bg-neutral-800 hover:text-white"
                  >
                    Contact seller
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                Seller information is unavailable.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
