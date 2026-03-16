"use client";

import { useActionState, useMemo, useState } from "react";
import {
  deleteWeeklyScheduleAction,
  saveWeeklyScheduleAction,
} from "@/app/actions/schedules";
import type { SaveWeeklyScheduleState } from "@/app/actions/schedules";
import type { EmployeeScheduleTableRow, Weekday } from "@/lib/db";
import { ScheduleCalculator } from "@/lib/schedule-calculator";

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

type EditableSchedule = Record<Weekday, DaySchedule>;

function toTimeInput(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 5);
}

function toEditableSchedule(row: EmployeeScheduleTableRow): EditableSchedule {
  return {
    monday: {
      isOff: row.days.monday.is_off,
      start: toTimeInput(row.days.monday.start_time),
      end: toTimeInput(row.days.monday.end_time),
    },
    tuesday: {
      isOff: row.days.tuesday.is_off,
      start: toTimeInput(row.days.tuesday.start_time),
      end: toTimeInput(row.days.tuesday.end_time),
    },
    wednesday: {
      isOff: row.days.wednesday.is_off,
      start: toTimeInput(row.days.wednesday.start_time),
      end: toTimeInput(row.days.wednesday.end_time),
    },
    thursday: {
      isOff: row.days.thursday.is_off,
      start: toTimeInput(row.days.thursday.start_time),
      end: toTimeInput(row.days.thursday.end_time),
    },
    friday: {
      isOff: row.days.friday.is_off,
      start: toTimeInput(row.days.friday.start_time),
      end: toTimeInput(row.days.friday.end_time),
    },
    saturday: {
      isOff: row.days.saturday.is_off,
      start: toTimeInput(row.days.saturday.start_time),
      end: toTimeInput(row.days.saturday.end_time),
    },
    sunday: {
      isOff: row.days.sunday.is_off,
      start: toTimeInput(row.days.sunday.start_time),
      end: toTimeInput(row.days.sunday.end_time),
    },
  };
}

function formatTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  return value.slice(0, 5);
}

type SchedulesTableProps = {
  rows: EmployeeScheduleTableRow[];
};

export default function SchedulesTable({ rows }: SchedulesTableProps) {
  const [editingRow, setEditingRow] = useState<EmployeeScheduleTableRow | null>(
    null,
  );
  const [editableSchedule, setEditableSchedule] =
    useState<EditableSchedule | null>(null);
  const [state, formAction, isPending] = useActionState(
    saveWeeklyScheduleAction,
    initialSaveWeeklyScheduleState,
  );

  const editingDailyHours = useMemo(() => {
    if (!editableSchedule) {
      return null;
    }

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
      const config = editableSchedule[day.key];
      result[day.key] = config.isOff
        ? 0
        : ScheduleCalculator.tryComputeWorkHours(config.start, config.end);
    }

    return result;
  }, [editableSchedule]);

  const openModifyModal = (row: EmployeeScheduleTableRow) => {
    setEditingRow(row);
    setEditableSchedule(toEditableSchedule(row));
  };

  const closeModifyModal = () => {
    setEditingRow(null);
    setEditableSchedule(null);
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-zinc-800">Schedules</h2>

      {rows.length === 0 ? (
        <p className="text-zinc-600">No schedules assigned yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-700">
                <th rowSpan={2} className="px-3 py-2 align-middle">
                  Employee name
                </th>
                <th rowSpan={2} className="px-3 py-2 align-middle">
                  User ID
                </th>
                {WEEKDAY_META.map((day) => (
                  <th
                    key={`header-${day.key}`}
                    colSpan={3}
                    className="px-3 py-2 text-center"
                  >
                    {day.label}
                  </th>
                ))}
                <th rowSpan={2} className="px-3 py-2 align-middle">
                  Actions
                </th>
              </tr>
              <tr className="border-b border-zinc-200 text-zinc-700">
                {WEEKDAY_META.flatMap((day) => [
                  <th key={`${day.key}-start`} className="px-3 py-2">
                    Start
                  </th>,
                  <th key={`${day.key}-end`} className="px-3 py-2">
                    End
                  </th>,
                  <th key={`${day.key}-hours`} className="px-3 py-2">
                    Hours
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`row-${row.employee_id}`}
                  className="border-b border-zinc-100"
                >
                  <td className="px-3 py-2 font-medium text-zinc-900">
                    {row.employee_name}
                  </td>
                  <td className="px-3 py-2 text-zinc-800">{row.user_id}</td>
                  {WEEKDAY_META.flatMap((day) => {
                    const info = row.days[day.key];

                    if (info.is_off) {
                      return [
                        <td
                          key={`${row.employee_id}-${day.key}-start`}
                          className="px-3 py-2 text-zinc-800"
                        >
                          OFF
                        </td>,
                        <td
                          key={`${row.employee_id}-${day.key}-end`}
                          className="px-3 py-2 text-zinc-800"
                        >
                          OFF
                        </td>,
                        <td
                          key={`${row.employee_id}-${day.key}-hours`}
                          className="px-3 py-2 text-zinc-800"
                        >
                          0
                        </td>,
                      ];
                    }

                    return [
                      <td
                        key={`${row.employee_id}-${day.key}-start`}
                        className="px-3 py-2 text-zinc-800"
                      >
                        {formatTime(info.start_time)}
                      </td>,
                      <td
                        key={`${row.employee_id}-${day.key}-end`}
                        className="px-3 py-2 text-zinc-800"
                      >
                        {formatTime(info.end_time)}
                      </td>,
                      <td
                        key={`${row.employee_id}-${day.key}-hours`}
                        className="px-3 py-2 text-zinc-800"
                      >
                        {info.work_hours}
                      </td>,
                    ];
                  })}
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openModifyModal(row)}
                        className="rounded-md bg-amber-600 px-3 py-1 text-white transition hover:bg-amber-700"
                      >
                        Modify
                      </button>
                      <form
                        action={deleteWeeklyScheduleAction}
                        onSubmit={(event) => {
                          const confirmed = window.confirm(
                            "Delete this employee schedule?",
                          );
                          if (!confirmed) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input
                          type="hidden"
                          name="employee_id"
                          value={String(row.employee_id)}
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingRow && editableSchedule ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-zinc-400 bg-zinc-100 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                Modify schedule: {editingRow.employee_name}
              </h3>
              <button
                type="button"
                onClick={closeModifyModal}
                className="rounded-lg bg-zinc-200 px-3 py-1 text-zinc-800 transition hover:bg-zinc-300"
              >
                Close
              </button>
            </div>

            <form action={formAction} className="grid gap-3">
              <input
                type="hidden"
                name="employee_id"
                value={String(editingRow.employee_id)}
              />

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
                      const value = editableSchedule[day.key];
                      const hours = editingDailyHours
                        ? editingDailyHours[day.key]
                        : null;

                      return (
                        <tr
                          key={`edit-${day.key}`}
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
                                setEditableSchedule((current) =>
                                  current
                                    ? {
                                        ...current,
                                        [day.key]: {
                                          ...current[day.key],
                                          isOff: event.target.checked,
                                        },
                                      }
                                    : current,
                                )
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
                                setEditableSchedule((current) =>
                                  current
                                    ? {
                                        ...current,
                                        [day.key]: {
                                          ...current[day.key],
                                          start: event.target.value,
                                        },
                                      }
                                    : current,
                                )
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
                                setEditableSchedule((current) =>
                                  current
                                    ? {
                                        ...current,
                                        [day.key]: {
                                          ...current[day.key],
                                          end: event.target.value,
                                        },
                                      }
                                    : current,
                                )
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

              {state.error ? (
                <p className="text-sm text-red-700">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="text-sm text-emerald-700">
                  Schedule updated successfully.
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={closeModifyModal}
                  className="rounded-lg bg-zinc-200 px-4 py-2 text-zinc-800 transition hover:bg-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
