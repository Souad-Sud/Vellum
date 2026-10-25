
export type Profile = {
  id?: string;
  email?: string | null;
  username?: string | null;
  address?: string | null;
  city?: string | null;
  zip_code?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  role?: string | null;
  description?: string | null;
  image_url_profile?: string | null;
};

export type ProfileFormState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export type ProfileFormProps = {
  mode: "create" | "edit";
  profile?: Profile;
  state: ProfileFormState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};
