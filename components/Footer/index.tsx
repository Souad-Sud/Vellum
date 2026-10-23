
import Link from "next/link";
import { Logo } from "../Logo";
import { footerNavLinks } from "@/data/footerNavigationLinks";

const Footer = () => {
  return (
    <footer className="border-t border-[#E5DCD0] bg-[#F7F3ED] mt-50 text-[#40382F]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Brand and tagline — kept here */}
        <div className="flex flex-col gap-4 py-10 sm:py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <Logo />

          <p className="max-w-sm text-lg leading-relaxed tracking-wide text-[#76695D] sm:text-xl md:text-right">
            Beauty, thoughtfully found.
          </p>
        </div>

        <div className="h-px w-full bg-[#DED4C7]" />

        {/* Footer navigation — rendered from data */}
        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 sm:gap-12 sm:py-12 md:grid-cols-3 md:py-16">
          {footerNavLinks.map((section) => (
            <div key={section.title}>
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#8B5E4A]">
                {section.title}
              </h2>

              <ul className="space-y-3 text-lg text-[#62574D]">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-200 hover:text-[#8B5E4A]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Brand message — kept here */}
          <div className="sm:col-span-2 md:col-span-1">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#8B5E4A]">
              A more thoughtful way to shop
            </h2>

            <p className="max-w-xs text-lg leading-8 text-[#76695D]">
              Discover beautiful finds, give pre-loved items a new
              home, and make every choice a little more meaningful.
            </p>
          </div>
        </div>

        {/* Bottom bar — kept here */}
        <div className="flex flex-col gap-4 border-t border-[#DED4C7] py-6 text-base tracking-wide text-[#76695D] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} All rights reserved.
          </p>

          <p>
            Designed &amp; built by{" "}
            <span className="font-medium text-[#8B5E4A]">
              Souad Taki Härjerud
            </span>
          </p>

          <Link
            href="/privacy"
            className="w-fit transition-colors duration-200 hover:text-[#8B5E4A]"
          >
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
