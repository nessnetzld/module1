"use server";

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

const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

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

    console.info(
      `[schedules] save success employee_id=${employeeId} days=${days.length}`,
    );

    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown schedule error.";

    console.error(
      `[schedules] save failed employee_id=${employeeId} error=${message}`,
    );

    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteWeeklyScheduleAction(
  formData: FormData,
): Promise<void> {
  const employeeIdRaw = String(formData.get("employee_id") ?? "").trim();
  const employeeId = Number(employeeIdRaw);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    console.error("[schedules] delete failed: invalid employee_id");
    return;
  }

  await deleteEmployeeWeeklySchedule(employeeId);
  console.info(`[schedules] delete success employee_id=${employeeId}`);
  revalidatePath("/");
}
