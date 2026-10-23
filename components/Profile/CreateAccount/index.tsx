"use client";

import { useActionState, useState } from "react";
import SignUp from "@/app/actions/signup-action";
import ProfileForm from "../ProfileForm";

export function CreateAccount() {
  const [state, formAction, pending] = useActionState(SignUp, null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col justify-center">
      <div className="mb-4 rounded-lg border border-transparent p-[2px] transition-colors duration-300 hover:border-amber-50 hover:shadow-lg sm:mb-6">
        <button
          type="button"
          aria-expanded={showForm}
          onClick={() => setShowForm((prev) => !prev)}
          className="w-full cursor-pointer rounded-[6px] border border-gray-300 bg-whitesmoke px-4 py-3 text-center text-sm font-medium text-black transition-colors duration-300 hover:border-transparent sm:px-6 sm:text-base"
        >
          {showForm ? "Hide signup form" : "Create an account"}
        </button>
      </div>

      <div
        className={`grid min-w-0 transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
          showForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!showForm}
      >
        <div className="min-h-0 min-w-0 overflow-hidden">
          <ProfileForm
            mode="create"
            state={state}
            formAction={formAction}
            pending={pending}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
