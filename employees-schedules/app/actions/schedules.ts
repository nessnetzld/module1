"use server";

// Server actions for employee schedule operations.
// "use server" marks every exported function as a Next.js Server Action,
// meaning they run only on the server and are callable directly from client components.

import { revalidatePath } from "next/cache";
import {
  deleteEmployeeWeeklySchedule,
  upsertEmployeeWeeklySchedule,
} from "@/lib/db";
import type { EmployeeScheduleDayInput, Weekday } from "@/lib/db";
import { ScheduleCalculator } from "@/lib/schedule-calculator";

export type SaveWeeklyScheduleState = {
  success: boolean;
  error: string | null;
};

// LIST: WEEKDAYS is an ordered array of all seven weekday keys used to iterate
// over the form fields and build the schedule input array in a consistent order.
const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Processes the weekly schedule form submission for a selected employee.
// Validates the employee ID, maps each weekday's form fields into schedule day objects,
// persists them via upsertEmployeeWeeklySchedule, then returns a state object that
// React's useActionState hook passes back to the form component.
// ASYNCHRONOUS FUNCTION: uses async/await to call the database layer without blocking.
// HANDLING EXCEPTIONS: the outer try/catch converts any DB or validation error into
// a user-visible error string returned in the state object instead of crashing the app.
export async function saveWeeklyScheduleAction(
  _prevState: SaveWeeklyScheduleState,
  formData: FormData,
): Promise<SaveWeeklyScheduleState> {
  const employeeIdRaw = String(formData.get("employee_id") ?? "").trim();
  const employeeId = Number(employeeIdRaw);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return {
      success: false,
      error: "Select a valid employee before saving schedule.",
    };
  }

  try {
    // LIST: maps the WEEKDAYS array into an array of EmployeeScheduleDayInput objects,
    // reading each day's checkbox, start, and end fields from the submitted FormData.
    // HANDLING EXCEPTIONS: throws inside .map() when a non-OFF day is missing start or
    // end times; the outer catch block intercepts this and returns it as an error message.
    const days: EmployeeScheduleDayInput[] = WEEKDAYS.map((weekday) => {
      const isOff = formData.get(`${weekday}_is_off`) === "on";
      const start = String(formData.get(`${weekday}_start`) ?? "").trim();
      const end = String(formData.get(`${weekday}_end`) ?? "").trim();

      if (isOff) {
        return {
          weekday,
          is_off: true,
          start_time: null,
          end_time: null,
          work_hours: 0,
        };
      }

      if (!start || !end) {
        throw new Error(`Start and end time are required for ${weekday}.`);
      }

      return {
        weekday,
        is_off: false,
        start_time: start,
        end_time: end,
        work_hours: ScheduleCalculator.computeWorkHoursOrThrow(start, end),
      };
    });

    await upsertEmployeeWeeklySchedule({
      employee_id: employeeId,
      days,
    });

    // DISPLAY OUTPUT TO THE TERMINAL: logs a success entry in the server console
    // so developers can confirm the schedule was persisted and trace the employee.
    console.info(
      `[schedules] save success employee_id=${employeeId} days=${days.length}`,
    );

    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
    // HANDLING EXCEPTIONS: catches any Error thrown during day mapping or the DB upsert.
    // Extracts the message string so the UI can display it to the user as feedback.
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown schedule error.";

    // DISPLAY OUTPUT TO THE TERMINAL: logs the failure with the employee ID and error
    // message so developers can diagnose schedule save issues in the server logs.
    console.error(
      `[schedules] save failed employee_id=${employeeId} error=${message}`,
    );

    return {
      success: false,
      error: message,
    };
  }
}

// Removes all weekly schedule rows for the employee identified in the form data.
// Validates the ID before calling the DB delete function, then revalidates the page
// cache so the schedules table reflects the deletion on the next render.
// ASYNCHRONOUS FUNCTION: uses async/await for the DB delete and cache revalidation.
export async function deleteWeeklyScheduleAction(
  formData: FormData,
): Promise<void> {
  const employeeIdRaw = String(formData.get("employee_id") ?? "").trim();
  const employeeId = Number(employeeIdRaw);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    // DISPLAY OUTPUT TO THE TERMINAL: logs the validation failure so the server console
    // records attempted deletes that arrived with an invalid employee ID.
    console.error("[schedules] delete failed: invalid employee_id");
    return;
  }

  await deleteEmployeeWeeklySchedule(employeeId);
  // DISPLAY OUTPUT TO THE TERMINAL: confirms successful deletion in the server logs
  // for auditing and debugging purposes.
  console.info(`[schedules] delete success employee_id=${employeeId}`);
  revalidatePath("/");
}
