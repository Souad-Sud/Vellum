"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function CategoryLinks({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 font-fira text-sm text-neutral-600 sm:gap-x-6 lg:gap-x-8">
      {categories.map((category) => {
        const href = `/categories/${category.slug}`;
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <li key={category.id} className="max-w-full">
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`block break-words font-cormorant text-lg transition-colors duration-200 sm:text-xl ${
                isActive
                  ? "text-amber-700 underline decoration-amber-700 underline-offset-8"
                  : "text-neutral-700 hover:text-amber-700"
              }`}
            >
              {category.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}