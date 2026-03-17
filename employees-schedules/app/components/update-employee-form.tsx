"use client";

// Client component for editing an existing employee record.
// Rendered on the browser so it can manage search state and the modal locally
// before submitting the changed data to the server action.

import { useActionState, useState } from "react";
import { updateEmployeeAction } from "@/app/actions/employees";
import type { UpdateEmployeeState } from "@/app/actions/employees";
import type { schedules } from "@/lib/db";

const initialUpdateEmployeeState: UpdateEmployeeState = {
  success: false,
  error: null,
};

type EditableEmployee = {
  employee_id_current: string;
  employee_id_new: string;
  company: string;
  lob: string;
  employee_name: string;
  user_id: string;
  hire_date: string;
  last_day: string;
};

// Converts a read-only schedules DB row into the mutable EditableEmployee shape.
// All numeric IDs are converted to strings because HTML <input> values are always strings.
function toEditableEmployee(employee: schedules): EditableEmployee {
  return {
    employee_id_current: String(employee.employee_id),
    employee_id_new: String(employee.employee_id),
    company: employee.company,
    lob: employee.lob,
    employee_name: employee.employee_name,
    user_id: employee.user_id,
    hire_date: employee.hire_date,
    last_day: employee.last_day ?? "",
  };
}

type UpdateEmployeeFormProps = {
  employees: schedules[];
};

// React component that renders the "Update employee" button and modal form.
// Lets the user search for an existing employee, edit their fields, and submit
// the changes via updateEmployeeAction.
// ASYNCHRONOUS FUNCTION: useActionState wires up updateEmployeeAction, which is an
// async server action that applies the UPDATE query to the employee record in the DB.
export default function UpdateEmployeeForm({
  employees,
}: UpdateEmployeeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EditableEmployee | null>(null);
  const [state, formAction, isPending] = useActionState(
    updateEmployeeAction,
    initialUpdateEmployeeState,
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  // LIST: searchResults is a filtered subset of the employees array, narrowed down
  // to records whose name, user ID, or employee ID matches the current search term.
  const searchResults =
    normalizedSearch.length === 0
      ? []
      : employees.filter((employee) => {
          const employeeId = String(employee.employee_id);
          return (
            employee.employee_name.toLowerCase().includes(normalizedSearch) ||
            employee.user_id.toLowerCase().includes(normalizedSearch) ||
            employeeId.includes(normalizedSearch)
          );
        });

  // Clears the selected employee and search term, returning the modal to the search
  // view so the user can pick a different employee to edit.
  const handleCancelEdit = () => {
    setSelectedEmployee(null);
    setSearchTerm("");
  };

  return (
    <div>
      <button
        type="button"
        className="rounded-lg bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700"
        onClick={() => setIsOpen((current) => !current)}
      >
        Update employee
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-400 bg-zinc-100 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Update employee
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-zinc-200 px-3 py-1 text-zinc-800 transition hover:bg-zinc-300"
              >
                Close
              </button>
            </div>

            {selectedEmployee === null ? (
              <div className="grid gap-3">
                <p className="text-sm text-zinc-700">
                  Search employee by name, employee ID, or user ID.
                </p>

                <div className="grid gap-1">
                  <label
                    htmlFor="search_employee"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Search employee
                  </label>
                  <input
                    id="search_employee"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Name, employee ID, or user ID"
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-300 bg-white">
                  {normalizedSearch.length === 0 ? (
                    <p className="p-3 text-sm text-zinc-600">
                      Type to search employees.
                    </p>
                  ) : searchResults.length === 0 ? (
                    <p className="p-3 text-sm text-zinc-600">
                      No matching employees found.
                    </p>
                  ) : (
                    <ul>
                      {searchResults.map((employee) => (
                        <li
                          key={`search-${employee.employee_id}-${employee.user_id}`}
                          className="border-b border-zinc-200 last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEmployee(toEditableEmployee(employee))
                            }
                            className="w-full px-3 py-2 text-left transition hover:bg-zinc-100"
                          >
                            <p className="text-sm font-semibold text-zinc-900">
                              {employee.employee_name}
                            </p>
                            <p className="text-xs text-zinc-700">
                              ID: {employee.employee_id} | User:{" "}
                              {employee.user_id}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <form action={formAction} className="grid gap-3">
                <input
                  type="hidden"
                  name="employee_id_current"
                  value={selectedEmployee.employee_id_current}
                />

                <div className="grid gap-1">
                  <label
                    htmlFor="employee_id_new"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Employee ID
                  </label>
                  <input
                    id="employee_id_new"
                    name="employee_id_new"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    title="Use numbers only"
                    required
                    value={selectedEmployee.employee_id_new}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, employee_id_new: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    htmlFor="company_update"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Company
                  </label>
                  <input
                    id="company_update"
                    name="company"
                    type="text"
                    required
                    value={selectedEmployee.company}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, company: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    htmlFor="lob_update"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    LOB
                  </label>
                  <input
                    id="lob_update"
                    name="lob"
                    type="text"
                    required
                    value={selectedEmployee.lob}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, lob: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    htmlFor="employee_name_update"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Employee name
                  </label>
                  <input
                    id="employee_name_update"
                    name="employee_name"
                    type="text"
                    required
                    value={selectedEmployee.employee_name}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, employee_name: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    htmlFor="user_id_update"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    User ID
                  </label>
                  <input
                    id="user_id_update"
                    name="user_id"
                    type="text"
                    required
                    value={selectedEmployee.user_id}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, user_id: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    htmlFor="hire_date_update"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Hire date
                  </label>
                  <input
                    id="hire_date_update"
                    name="hire_date"
                    type="date"
                    required
                    value={selectedEmployee.hire_date}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, hire_date: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    htmlFor="last_day"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Last day (optional)
                  </label>
                  <input
                    id="last_day"
                    name="last_day"
                    type="date"
                    value={selectedEmployee.last_day}
                    onChange={(event) =>
                      setSelectedEmployee((current) =>
                        current
                          ? { ...current, last_day: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                {state.error ? (
                  <p className="text-sm text-red-700">{state.error}</p>
                ) : null}
                {state.success ? (
                  <p className="text-sm text-emerald-700">
                    Employee updated successfully.
                  </p>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Updating..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-lg bg-zinc-200 px-4 py-2 text-zinc-800 transition hover:bg-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
