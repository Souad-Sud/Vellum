import Link from "next/link";

const Vedio = () => {
return ( <section className="relative h-[600px] w-full overflow-hidden">
{/* Background video */} <video
     autoPlay
     muted
     loop
     playsInline
     className="absolute inset-0 h-full w-full object-cover object-center"
   > <source
       src="/vedio/rituals-aeonian-homepage-hero-video-dekstop-2026-0x1080-5000k.mp4"
       type="video/mp4"
     /> </video>

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/25" />

  {/* Text on top of the video */}
  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
    <p className="mb-4 text-sm uppercase tracking-[0.3em]">
      Discover your moment
    </p>

    <h1 className="max-w-3xl font-cormorant text-5xl font-medium md:text-7xl">
      Find Your Everyday Ritual
    </h1>

    <p className="mt-6 max-w-xl text-base md:text-lg">
      Transform everyday routines into moments of calm, beauty, and
      well-being.
    </p>

    <Link
      href="/categories/the-aeonian-parfum"
      className="mt-8 rounded-full border border-white px-8 py-3 text-sm transition-colors hover:bg-white hover:text-neutral-900"
    >
      Explore Perfumes
    </Link>
  </div>
</section>
);
};

export default Vedio;
