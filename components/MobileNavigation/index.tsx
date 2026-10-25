
"use client";

import { useState } from "react";
import Link from "next/link";

type NavigationLink = {
  href: string;
  label: string;
  className: string;
  unreadCount?: number;
};

type MobileNavigationProps = {
  links: NavigationLink[];
};

export const MobileNavigation = ({
  links,
}: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const messagePaths = ["/seller/messages", "/buyer/message"];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={
          isOpen ? "Close navigation menu" : "Open navigation menu"
        }
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      >
        {isOpen ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="absolute right-0 top-full mt-3 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-3 shadow-xl"
        >
          <ul className="flex flex-col gap-1 font-fira text-neutral-700">
            {links.map((link) => {
              const showUnread =
                messagePaths.includes(link.href) &&
                (link.unreadCount ?? 0) > 0;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 hover:bg-neutral-100 ${link.className}`}
                  >
                    <span>{link.label}</span>

                    {showUnread && (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold leading-none text-white">
                        {(link.unreadCount ?? 0) > 99
                          ? "99+"
                          : link.unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
