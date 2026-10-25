type FieldErrorProps = {
  errors?: string[];
};

export default function FieldError({ errors }: FieldErrorProps) {
  if (!errors?.length) return null;

  return (
    <ul className="space-y-1 text-sm text-red-500">
      {errors.map((error, index) => (
        <li key={`${index}-${error}`}>{error}</li>
      ))}
    </ul>
  );
}
