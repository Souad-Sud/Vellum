
type Props = {
  mode: "create" | "edit";
  pending: boolean;
  disabled?: boolean;
};

export default function ProfileSubmitButton({
  mode,
  pending,
  disabled = false,
}: Props) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending
        ? mode === "create"
          ? "Creating account..."
          : "Saving changes..."
        : mode === "create"
          ? "Create account"
          : "Save changes"}
    </button>
  );
}
