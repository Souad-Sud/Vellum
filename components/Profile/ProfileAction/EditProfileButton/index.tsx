"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import editProfile from "@/app/actions/edit-profile-action";
import type { Profile } from "@/types/profile";
import ProfileForm from "../../ProfileForm";


type EditProfileButtonProps = {
  profile: Profile;
};

export default function EditProfileButton({
  profile,
}: EditProfileButtonProps) {
  const [state, formAction, pending] = useActionState(
    editProfile,
    null
  );

  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.message) {
      router.refresh();
    }
  }, [state?.message, router]);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col items-center">
      <div className="mb-4 rounded-lg border border-transparent p-[2px] transition-colors duration-300 sm:mb-6">
        <button
          type="button"
          aria-expanded={isEditing}
          onClick={() => setIsEditing((previous) => !previous)}
          className="inline-flex h-12 w-40 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#B85F43] bg-[#A4715B] px-4 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:border-none hover:bg-[#C5D9B8] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F43] focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          {isEditing ? "Cancel editing" : "Edit profile"}
        </button>
      </div>

      <div
        className={`grid w-full min-w-0 transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
          isEditing
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isEditing}
      >
        <div className="min-h-0 min-w-0 overflow-hidden">
          <ProfileForm
            mode="edit"
            profile={profile}
            state={state}
            formAction={formAction}
            pending={pending}
          />
        </div>
      </div>
    </div>
  );
}
