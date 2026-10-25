
import { NavigationLink } from "@/types/navbarLinks";

export const navigationLinks: NavigationLink[] = [
  {
    href: "/reserved",
    label: "Reserved",
    className: "transition-colors hover:text-neutral-950",
    roles: ["buyer"],
  },
  {
    href: "/profile",
    label: "Account",
    className: "transition-colors hover:text-neutral-950",
  },
  {
    href: "/listings/new",
    label: "New listing",
    className:
      "rounded-full bg-gradient-to-r from-orange-400 via-violet-400 to-purple-900 px-5 py-2.5 text-black transition-all hover:scale-105",
    roles: ["seller"],
  },
  {
    href: "/homepage",
    label: "Products",
    className: "transition-colors hover:text-neutral-950",
  },
  {
    href: "/my-products",
    label: "My products",
    className: "transition-colors hover:text-neutral-950",
    roles: ["seller"],
  },
  {
    href: "/seller/messages",
    label: "Messages",
    className: "transition-colors hover:text-neutral-950",
    roles: ["seller"],
  },
  {
    href: "/buyer/messages",
    label: "Messages",
    className: "transition-colors hover:text-neutral-950",
    roles: ["buyer"],
  },
];

export const slugNavigationLinks = [
  {
    href: "/homepage",
    label: "Home",
    className: "transition-colors hover:text-neutral-950",
  },
];
