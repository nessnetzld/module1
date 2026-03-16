"use client";

import { useActionState, useMemo, useState } from "react";
import { saveWeeklyScheduleAction } from "@/app/actions/schedules";
import type { SaveWeeklyScheduleState } from "@/app/actions/schedules";
import type { Weekday, schedules } from "@/lib/db";
import {
  ScheduleCalculator,
  sumHoursRecursive,
} from "@/lib/schedule-calculator";

const initialSaveWeeklyScheduleState: SaveWeeklyScheduleState = {
  success: false,
  error: null,
};

const WEEKDAY_META: Array<{ key: Weekday; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

type DaySchedule = {
  isOff: boolean;
  start: string;
  end: string;
};

type ScheduleByDay = Record<Weekday, DaySchedule>;

type EmployeeScheduleFormProps = {
  employees: schedules[];
};

function createDefaultSchedule(): ScheduleByDay {
  return {
    monday: { isOff: false, start: "", end: "" },
    tuesday: { isOff: false, start: "", end: "" },
    wednesday: { isOff: false, start: "", end: "" },
    thursday: { isOff: false, start: "", end: "" },
    friday: { isOff: false, start: "", end: "" },
    saturday: { isOff: false, start: "", end: "" },
    sunday: { isOff: false, start: "", end: "" },
  };
}

export default function EmployeeScheduleForm({
  employees,
}: EmployeeScheduleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<schedules | null>(
    null,
  );
  const [scheduleByDay, setScheduleByDay] = useState<ScheduleByDay>(
    createDefaultSchedule(),
  );
  const [state, formAction, isPending] = useActionState(
    saveWeeklyScheduleAction,
    initialSaveWeeklyScheduleState,
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
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

  const dailyHours = useMemo(() => {
    const result: Record<Weekday, number | null> = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    };

    for (const day of WEEKDAY_META) {
      const dayConfig = scheduleByDay[day.key];
      if (dayConfig.isOff) {
        result[day.key] = 0;
      } else {
        result[day.key] = ScheduleCalculator.tryComputeWorkHours(
          dayConfig.start,
          dayConfig.end,
        );
      }
    }

    return result;
  }, [scheduleByDay]);

  const totalWeeklyHours = useMemo(() => {
    const numericHours = WEEKDAY_META.map((day) => dailyHours[day.key] ?? 0);
    return sumHoursRecursive(numericHours);
  }, [dailyHours]);

  const resetSelection = () => {
    setSelectedEmployee(null);
    setSearchTerm("");
    setScheduleByDay(createDefaultSchedule());
  };

  return (
    <div>
      <button
        type="button"
        className="rounded-lg bg-amber-600 px-6 py-3 text-white transition hover:bg-amber-700"
        onClick={() => setIsOpen((current) => !current)}
      >
        Assign schedule
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-zinc-400 bg-zinc-100 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Weekly schedule
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
                    htmlFor="schedule_search_employee"
                    className="text-sm font-semibold text-zinc-900"
                  >
                    Search employee
                  </label>
                  <input
                    id="schedule_search_employee"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Name, employee ID, or user ID"
                    className="rounded-md border border-zinc-500 bg-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-300 bg-white">
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
                          key={`schedule-${employee.employee_id}-${employee.user_id}`}
                          className="border-b border-zinc-200 last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setScheduleByDay(createDefaultSchedule());
                            }}
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
                  name="employee_id"
                  value={String(selectedEmployee.employee_id)}
                />

                <div className="rounded-lg border border-zinc-300 bg-white p-3">
                  <p className="text-sm font-semibold text-zinc-900">
                    Employee: {selectedEmployee.employee_name}
                  </p>
                  <p className="text-xs text-zinc-700">
                    ID: {selectedEmployee.employee_id} | User:{" "}
                    {selectedEmployee.user_id}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-300 bg-white">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-700">
                        <th className="px-3 py-2">Day</th>
                        <th className="px-3 py-2">OFF</th>
                        <th className="px-3 py-2">Start</th>
                        <th className="px-3 py-2">End</th>
                        <th className="px-3 py-2">Work hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEEKDAY_META.map((day) => {
                        const value = scheduleByDay[day.key];
                        const hours = dailyHours[day.key];

                        return (
                          <tr
                            key={day.key}
                            className="border-b border-zinc-100 last:border-b-0"
                          >
                            <td className="px-3 py-2 font-medium text-zinc-900">
                              {day.label}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                name={`${day.key}_is_off`}
                                type="checkbox"
                                checked={value.isOff}
                                onChange={(event) =>
                                  setScheduleByDay((current) => ({
                                    ...current,
                                    [day.key]: {
                                      ...current[day.key],
                                      isOff: event.target.checked,
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                name={`${day.key}_start`}
                                type="time"
                                value={value.start}
                                disabled={value.isOff}
                                onChange={(event) =>
                                  setScheduleByDay((current) => ({
                                    ...current,
                                    [day.key]: {
                                      ...current[day.key],
                                      start: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-md border border-zinc-400 px-2 py-1 text-zinc-900 disabled:bg-zinc-100"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                name={`${day.key}_end`}
                                type="time"
                                value={value.end}
                                disabled={value.isOff}
                                onChange={(event) =>
                                  setScheduleByDay((current) => ({
                                    ...current,
                                    [day.key]: {
                                      ...current[day.key],
                                      end: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-md border border-zinc-400 px-2 py-1 text-zinc-900 disabled:bg-zinc-100"
                              />
                            </td>
                            <td className="px-3 py-2 text-zinc-800">
                              {value.isOff
                                ? "OFF"
                                : hours !== null
                                  ? `${hours} h`
                                  : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm font-semibold text-zinc-900">
                  Weekly total: {Number(totalWeeklyHours.toFixed(2))} h
                </p>

                <p className="text-xs text-zinc-700">
                  Calculated as end - start - 1h lunch - 30m break.
                </p>

                {state.error ? (
                  <p className="text-sm text-red-700">{state.error}</p>
                ) : null}
                {state.success ? (
                  <p className="text-sm text-emerald-700">
                    Weekly schedule saved successfully.
                  </p>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : "Save schedule"}
                  </button>
                  <button
                    type="button"
                    onClick={resetSelection}
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
