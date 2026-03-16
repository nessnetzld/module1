"use client";

import { useActionState, useState } from "react";
import { createEmployeeAction } from "@/app/actions/employees";
import type { CreateEmployeeState } from "@/app/actions/employees";

const initialCreateEmployeeState: CreateEmployeeState = {
  success: false,
  error: null,
};

export default function NewEmployeeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createEmployeeAction,
    initialCreateEmployeeState,
  );

  return (
    <div>
      <button
        type="button"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
        onClick={() => setIsOpen((current) => !current)}
      >
        New employee
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-zinc-400 bg-zinc-100 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                New employee
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-zinc-200 px-3 py-1 text-zinc-800 transition hover:bg-zinc-300"
              >
                Close
              </button>
            </div>

            <form action={formAction} className="grid gap-3">
              <div className="grid gap-1">
                <label
                  htmlFor="company"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="employee_id"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Employee ID
                </label>
                <input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  title="Use numbers only"
                  required
                  className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="lob"
                  className="text-sm font-semibold text-zinc-900"
                >
                  LOB
                </label>
                <input
                  id="lob"
                  name="lob"
                  type="text"
                  required
                  className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="employee_name"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Employee name
                </label>
                <input
                  id="employee_name"
                  name="employee_name"
                  type="text"
                  required
                  className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="user_id"
                  className="text-sm font-semibold text-zinc-900"
                >
                  User ID
                </label>
                <input
                  id="user_id"
                  name="user_id"
                  type="text"
                  required
                  className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="hire_date"
                  className="text-sm font-semibold text-zinc-900"
                >
                  Hire date
                </label>
                <input
                  id="hire_date"
                  name="hire_date"
                  type="date"
                  required
                  className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                />
              </div>

              {state.error ? (
                <p className="text-sm text-red-700">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="text-sm text-emerald-700">
                  Employee created successfully.
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save employee"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-zinc-200 px-4 py-2 text-zinc-800 transition hover:bg-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
