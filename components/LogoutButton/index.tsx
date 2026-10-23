
import logoutAction from "@/app/actions/logout-action";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="whitespace-nowrap cursor-pointer text-neutral-600 transition-colors hover:text-red-600"
      >
        Log out
      </button>
    </form>
  );
}
