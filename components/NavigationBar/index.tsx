
import { Logo } from "../Logo";
import { navigationLinks } from "@/data/navigationLinks";
import type { UserRole } from "@/types/navbarLinks";
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

  let role: UserRole | null = null;
  let unreadCount = 0;

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

    // Count unread messages received by this user.
    if (role === "buyer" || role === "seller") {
      const recipientColumn =
        role === "buyer" ? "buyer_id" : "seller_id";

      const { count, error: unreadError } = await supabase
        .from("seller_messages")
        .select("id", { count: "exact", head: true })
        .eq(recipientColumn, user.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      if (unreadError) {
        console.error("Error fetching unread messages:", unreadError);
      } else {
        unreadCount = count ?? 0;
      }
    }
  }

  const visibleLinks = navigationLinks.filter((link) => {
    if (!link.roles) return true;

    return role !== null && link.roles.includes(role);
  });

  const messagePaths = ["/seller/messages", "/buyer/messages"];

  const mobileLinks = visibleLinks.map((link) => ({
    ...link,
    ...(messagePaths.includes(link.href) ? { unreadCount } : {}),
  }));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:min-h-20 lg:px-10">
        <div className="shrink-0">
          <Logo link={true} />
        </div>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-4 font-fira text-neutral-600 md:flex lg:gap-8">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${link.className} inline-flex items-center gap-2 whitespace-nowrap`}
              >
                {link.label}

                {messagePaths.includes(link.href) &&
                  unreadCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold leading-none text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
              </Link>
            </li>
          ))}
        </ul>

        {/* User role and logout */}
        {user && (
          <div className="flex shrink-0 items-center gap-3">
            {role && (
              <span className="rounded-full border border-[#DED4C7] bg-[#F7F3ED] px-3 py-1 text-sm font-medium text-[#8B5E4A]">
                You are a {role === "seller" ? "Seller" : "Buyer"}
              </span>
            )}

            <LogoutButton />
          </div>
        )}

        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNavigation links={mobileLinks} />
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
