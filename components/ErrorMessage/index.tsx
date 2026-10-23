type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-100 p-5 text-center text-red-600">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p>{message}</p>
    </div>
  );
}