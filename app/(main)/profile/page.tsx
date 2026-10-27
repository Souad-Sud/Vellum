
import { Logo } from "@/components/Logo";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileIdentity from "@/components/Profile/ProfileIdentity";
import { getProfile } from "@/lib/supabase/queries/users";
import { requireUser } from "@/lib/supabase/require-user";
import {
  getDisplayName,
  getDisplayRole,
  getProfileFields,
} from "@/utils/profileUtils";
import { DeleteProfileButton } from "@/components/Profile/ProfileAction/DeleteProfileButton";
import EditProfileButton from "@/components/Profile/ProfileAction/EditProfileButton";

export default async function ProfilePage() {
  const { user } = await requireUser();

  const profile = await getProfile(user.id);

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-xl rounded-3xl border border-[#E8DED2] bg-[#FFFCF8] p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E3D8] text-[#B85F43]">
            <Logo />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B85F43]">
            Your personal space
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-black">
            Your profile is on its way
          </h1>
        </section>
      </main>
    );
  }

  const displayName = getDisplayName(profile);
  const role = getDisplayRole(profile);
  const fields = getProfileFields(profile);

  return (
    <main className="min-h-screen bg-[#F7F3ED] px-4 py-8 font-sans sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between">
          <ProfileHeader />

          <div className="flex flex-col items-center justify-center gap-4">
            <EditProfileButton profile={profile} />
            <DeleteProfileButton />
          </div>
        </div>

        <section className="mb-8 max-w-2xl sm:mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#B85F43]">
            Your personal space
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl lg:text-6xl">
            A little more
            <br className="sm:hidden" /> about you.
          </h1>

          <p className="mt-4 max-w-lg text-base leading-7 text-[#514940]">
            Your details, your story, all in one place. Make yourself at home.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E8DED2] bg-[#FFFCF8] shadow-[0_8px_40px_rgba(74,49,32,0.04)] sm:rounded-3xl">
          <ProfileIdentity
            displayName={displayName}
            role={role}
            imageUrl={profile.image_url_profile}
          />

          <ProfileDetails
            fields={fields}
            description={profile.description}
          />
        </section>
      </div>
    </main>
  );
}
