
type ProfileIdentityProps = {
  displayName: string;
  role: string;
  imageUrl: string | null;
};

export default function ProfileIdentity({
  displayName,
  role,
  imageUrl,
}: ProfileIdentityProps) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative overflow-hidden bg-[#EDE2D5] px-5 py-8 sm:px-9 sm:py-10">
      <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full border border-[#D9C6B3]" />
      <div className="pointer-events-none absolute -right-2 -top-8 h-36 w-36 rounded-full border border-[#D9C6B3]" />

      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${displayName}'s profile`}
            width={112}
            height={112}
            className="h-24 w-24 rounded-full border-4 border-[#FFFCF8] object-cover shadow-sm sm:h-28 sm:w-28"
          />
        ) : (
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[#FFFCF8] bg-[#B85F43] text-4xl font-semibold text-white shadow-sm sm:h-28 sm:w-28"
            aria-label={`Profile initial ${initial}`}
          >
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#69402E]">
            Welcome to your Ritual
          </p>

          <h2 className="break-words text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            {displayName}
          </h2>

          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#DCC8B5] bg-[#F7F0E8] px-3 py-1.5 text-sm font-medium tracking-wide text-black">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#B85F43]" />
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}
