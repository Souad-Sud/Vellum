
import {
  PROFILE_INPUT_CLASS,
  PROFILE_LABEL_CLASS,
} from "@/utils/profile";

type Option = {
  label: string;
  value: string;
};

type Props = {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string | null;
  errors?: string[];
};

export default function ProfileSelectField({
  name,
  label,
  options,
  defaultValue,
  errors,
}: Props) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className={PROFILE_LABEL_CLASS}>
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errors?.length ? errorId : undefined}
        className={`${PROFILE_INPUT_CLASS} ${
          errors?.length ? "border-red-500" : ""
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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
