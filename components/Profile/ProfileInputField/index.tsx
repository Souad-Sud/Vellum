import {
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
} from "@/utils/profile";
import FieldError from "../FieldError";


type ProfileInputFieldProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string | null;
  errors?: string[];
  autoComplete?: string;
};

export default function ProfileInputField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  minLength,
  maxLength,
  defaultValue,
  errors,
  autoComplete,
}: ProfileInputFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className={PROFILE_LABEL_CLASS}
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={
          errors?.length ? `${name}-error` : undefined
        }
        className={`${PROFILE_INPUT_CLASS} ${
          errors?.length
            ? "border-red-500 focus:ring-red-500"
            : ""
        }`}
      />

      <div id={`${name}-error`}>
        <FieldError errors={errors} />
      </div>
    </div>
  );
}
