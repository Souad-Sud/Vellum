
export type ProfileFieldData = {
  label: string;
  value: string | null | undefined;
  icon: string;
};

export default function ProfileField({
  label,
  value,
  icon,
}: ProfileFieldData) {
  return (
    <div className="group min-w-0 rounded-xl border border-[#EAE0D6] bg-white p-4 transition-colors duration-200 hover:border-[#D4B6A0] sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F2E7DC] text-lg text-[#A65D43]"
        >
          {icon}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black">
            {label}
          </p>

          <p className="mt-2 break-words font-sans text-base font-medium leading-6 tracking-[0.02em] text-black">
            {value || "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}
