"use client";

type ProfileSubmitButtonProps = {
  mode: "create" | "edit";
  pending: boolean;
  disabled?: boolean;
};

export default function ProfileSubmitButton({
  mode,
  pending,
  disabled = false,
}: ProfileSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-6 w-full rounded-full bg-[#A4715B] px-6 py-3 font-medium text-white transition-colors hover:bg-[#B85F43] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending
        ? "Saving..."
        : mode === "edit"
          ? "Save Changes"
          : "Create Account"}
    </button>
  );
}