
import type { InputHTMLAttributes } from "react";
import {
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
} from "@/utils/profile";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  name: string;
  label: string;
  errors?: string[];
};

export default function ProfileTextField({
  name,
  label,
  errors,
  className = "",
  ...inputProps
}: Props) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className={PROFILE_LABEL_CLASS}>
        {label}
        {inputProps.required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        {...inputProps}
        id={name}
        name={name}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errors?.length ? errorId : undefined}
        className={`${PROFILE_INPUT_CLASS} ${className} ${
          errors?.length ? "border-red-500" : ""
        }`}
      />

      {errors?.length ? (
        <ul id={errorId} className="text-sm text-red-500">
          {errors.map((error, index) => (
            <li key={`${index}-${error}`}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
