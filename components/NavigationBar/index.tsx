
import { Logo } from "../Logo";
import {
  navigationLinks,
  type UserRole,
} from "@/data/navigationLinks";
import { getCategories } from "@/lib/supabase/queries/categories";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LogoutButton } from "../LogoutButton";
import { MobileNavigation } from "../MobileNavigation";

const NavigationBar = async () => {
  const { error } = await getCategories();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching categories:", error);
  }

  // Fetch the authenticated user's role
  let role: UserRole | null = null;

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching user role:", profileError);
    } else if (
      profile?.role === "buyer" ||
      profile?.role === "seller"
    ) {
      role = profile.role;
    }
  }

  // Filter navigation links according to the user's role
  const visibleLinks = navigationLinks.filter((link) => {
    if (!link.roles) {
      return true;
    }

    return role !== null && link.roles.includes(role);
  });

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:min-h-20 lg:px-10">
        {/* Logo */}
        <div className="shrink-0">
          <Logo link={true} />
        </div>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-4 font-fira text-neutral-600 md:flex lg:gap-8">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${link.className} whitespace-nowrap`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* User role and logout */}
        {user && (
          <div className="flex shrink-0 items-center gap-3">
            {role && (
              <span className="rounded-full border border-[#DED4C7] bg-[#F7F3ED] px-3 py-1 text-sm font-medium capitalize text-[#8B5E4A]">
                {role}
              </span>
            )}

            <LogoutButton />
          </div>
        )}

        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNavigation links={visibleLinks} />
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
