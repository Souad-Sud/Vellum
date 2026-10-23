
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import Login from "@/app/actions/login-action";

export const LogIn = () => {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState(Login, null);

  const inputClass =
    "block w-full min-w-0 rounded-lg border border-gray-300 bg-input px-3 py-3 text-base outline-none transition-colors duration-300 placeholder:text-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 sm:px-4";

  const labelClass = "mb-2 block text-sm font-semibold";

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col justify-center">
      {/* Toggle button */}
      <div className="mb-4 rounded-lg border border-transparent p-[2px] transition-colors duration-300 hover:border-amber-50 hover:shadow-lg sm:mb-6">
        <button
          type="button"
          aria-expanded={showForm}
          onClick={() => setShowForm((prev) => !prev)}
          className="w-full cursor-pointer rounded-[6px] border border-gray-300 bg-whitesmoke px-4 py-3 text-center text-sm font-medium text-black transition-colors duration-300 hover:border-transparent sm:px-6 sm:text-base"
        >
          {showForm ? "Hide login form" : "Log in"}
        </button>
      </div>

      {/* Collapsible login form */}
      <div
        className={`grid min-w-0 transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
          showForm
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!showForm}
      >
        <div className="min-h-0 min-w-0 overflow-hidden">
          <form
            action={formAction}
            className="mb-6 w-full min-w-0 rounded-xl bg-cream p-4 shadow-lg sm:rounded-2xl sm:p-6 md:p-8"
          >
            <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">
              Welcome back
            </h2>

            {/* Login error */}
            {state?.error && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
              >
                {state.error}
              </p>
            )}

            {/* Email */}
            <div className="mb-4 sm:mb-5">
              <label htmlFor="login-email" className={labelClass}>
                Email
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email..."
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="mb-3 sm:mb-4">
              <label htmlFor="login-password" className={labelClass}>
                Password
              </label>

              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password..."
                className={inputClass}
              />
            </div>

            {/* Forgot password */}
            <div className="mb-5 text-right">
              <Link
                href="/forgot-password"
                className="text-sm underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            {/* Actual login button */}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white shadow-lg transition-colors duration-300 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              {pending ? "Logging in..." : "Log in"}
            </button>

            <p className="mt-5 text-center text-sm leading-relaxed sm:text-base">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold underline underline-offset-4"
              >
                Create account
              </Link>
            </p>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mt-3 w-full text-center text-sm underline underline-offset-4"
            >
              Close login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
