"use client";

import { useActionState, useState } from "react";
import deleteAccountAction from "@/app/actions/delete-account-action";

export function DeleteProfileButton() {
  const [state, formAction, pending] = useActionState(
    deleteAccountAction,
    null,
  );
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {/* Delete profile button */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        aria-haspopup="dialog"
        className="inline-flex h-12 w-40 shrink-0 items-center justify-center rounded-full border border-[#B85F43] bg-transparent px-4 text-sm font-medium tracking-wide text-[#B85F43] transition-all duration-300 hover:bg-[#B85F43] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F43] focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        Delete profile
      </button>

      {state?.error && (
        <p role="alert" className="mt-3 text-sm text-[#B85F43]">
          {state.error}
        </p>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#302820]/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!pending) setShowConfirm(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
            className="w-full max-w-md rounded-3xl border border-[#E8DED2] bg-[#FFFCF8] p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Warning icon */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E3D8]">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-7 w-7 text-[#B85F43]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>

            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#B85F43]">
              Your personal space
            </p>

            <h2
              id="delete-title"
              className="mt-2 text-center text-2xl font-medium tracking-tight text-[#302820]"
            >
              Delete your profile?
            </h2>

            <p
              id="delete-description"
              className="mt-3 text-center text-sm leading-6 text-[#71665C]"
            >
              Are you sure you want to permanently delete your profile and
              account? This action cannot be undone.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                disabled={pending}
                onClick={() => setShowConfirm(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#DED2C6] bg-transparent px-5 py-3 text-sm font-medium text-[#514940] transition-colors duration-300 hover:bg-[#F1EAE2] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              >
                Keep my profile
              </button>

              <form action={formAction} className="sm:flex-1">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex cursor-pointer min-h-12 w-full items-center justify-center rounded-full bg-[#8B5E4A] px-5 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-[#704735] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E4A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Deleting..." : "Yes, delete"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
