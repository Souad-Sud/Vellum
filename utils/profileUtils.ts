import { ProfileFieldData } from "@/components/Profile/ProfileField";


type Profile = {
  username: string | null;
  role: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
};

export function getDisplayName(profile: Profile) {
  return profile.username?.trim() || "Your profile";
}

export function getDisplayRole(profile: Profile) {
  if (!profile.role) return "Member";

  return profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
}

export function getProfileFields(
  profile: Profile,
): ProfileFieldData[] {
  return [
    { label: "Email", value: profile.email, icon: "✉" },
    { label: "City", value: profile.city, icon: "⌖" },
    { label: "Address", value: profile.address, icon: "⌂" },
    { label: "ZIP code", value: profile.zip_code, icon: "⌑" },
    { label: "Phone number", value: profile.phone_number, icon: "↗" },
    {
      label: "Date of birth",
      value: profile.date_of_birth
        ? new Date(
            `${profile.date_of_birth}T12:00:00`,
          ).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })
        : null,
      icon: "♡",
    },
  ];
}
