export type UserRole = "buyer" | "seller";

export type NavigationLink = {
  href: string;
  label: string;
  className: string;
  roles?: UserRole[];
  showRole?: boolean;
};