import ProfileField, { ProfileFieldData } from "../ProfileField";

type ProfileDetailsProps = {
  fields: ProfileFieldData[];
  description: string | null;
};

export default function ProfileDetails({
  fields,
  description,
}: ProfileDetailsProps) {
  return (
    <div className="p-5 sm:p-9 lg:p-10">
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <div className="h-8 w-1 rounded-full bg-[#B85F43]" />

        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-black">
            Personal information
          </h3>
          <p className="mt-1 text-sm tracking-wide text-[#514940]">
            The little details that make you, you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {fields.map((field) => (
          <ProfileField key={field.label} {...field} />
        ))}
      </div>

      <div className="mt-8 border-t border-[#EAE0D6] pt-7 sm:mt-10 sm:pt-8">
        <div className="flex items-center gap-3">
          <span className="text-xl text-[#B85F43]">✳</span>
          <h3 className="text-2xl font-semibold tracking-tight text-black">
            A little about me
          </h3>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-base leading-7 tracking-[0.01em] text-[#332820]">
          {description?.trim() ||
            "Your story is yours to tell. There is room for it here whenever you are ready."}
        </p>
      </div>
    </div>
  );
}
