
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const PROFILE_INPUT_CLASS =
  "w-full rounded-md border border-gray-300 px-3 py-2";

export const PROFILE_LABEL_CLASS =
  "mb-1 block text-sm font-medium";

export function validateProfileImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Image must be smaller than 5 MB.";
  }

  return null;
}
