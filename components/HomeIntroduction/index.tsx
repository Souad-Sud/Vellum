import Image from "next/image";

const products = [
  {
    src: "/home-image/body-mist-pink-2.jpg",
    alt: "Pink body mist",
  },
  {
    src: "/home-image/shower-gel-white-blue-2.jpg",
    alt: "Blue and white shower gel",
  },
  {
    src: "/home-image/body-mist-purple-2.jpg",
    alt: "Purple body mist",
  },
];

export const HomeIntroduction = () => {
  return (
    <section className="mx-4 mt-10 flex flex-col items-center text-center font-cormorant sm:mx-8 sm:mt-14 lg:mx-12 xl:mx-20 lg:mt-20">
      <h1 className="mb-8 text-2xl leading-relaxed sm:mb-10 sm:text-3xl lg:text-4xl">
        Discover new ideas,
        <br className="hidden sm:block" />
        find products that match your interests,
        <br className="hidden sm:block" />
        connect with others, and express yourself.
      </h1>

      <div className="grid w-full max-w-5xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.src}
            className="relative w-full max-w-[300px] p-[6px] shadow-[0_0_30px_rgba(255,255,255,0.12)]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={product.src}
                alt={product.alt}
                fill
                sizes="(max-width: 639px) 90vw, (max-width: 1279px) 45vw, 300px"
                className="object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};