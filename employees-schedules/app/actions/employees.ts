"use server";

import { revalidatePath } from "next/cache";
import { insertEmployee, updateEmployee } from "@/lib/db";

export type CreateEmployeeState = {
  success: boolean;
  error: string | null;
};

export type UpdateEmployeeState = {
  success: boolean;
  error: string | null;
};

export async function createEmployeeAction(
  _prevState: CreateEmployeeState,
  formData: FormData,
): Promise<CreateEmployeeState> {
  const company = String(formData.get("company") ?? "").trim();
  const employeeIdRaw = String(formData.get("employee_id") ?? "").trim();
  const lob = String(formData.get("lob") ?? "").trim();
  const employeeName = String(formData.get("employee_name") ?? "").trim();
  const userId = String(formData.get("user_id") ?? "").trim();
  const hireDate = String(formData.get("hire_date") ?? "").trim();

  if (
    !company ||
    !employeeIdRaw ||
    !lob ||
    !employeeName ||
    !userId ||
    !hireDate
  ) {
    return {
      success: false,
      error: "All fields are required.",
    };
  }

  const employeeId = Number(employeeIdRaw);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return {
      success: false,
      error: "employee_id must be a positive integer.",
    };
  }

  try {
    await insertEmployee({
      company,
      employee_id: employeeId,
      lob,
      employee_name: employeeName,
      user_id: userId,
      hire_date: hireDate,
    });

    console.info(
      `[employees] create success employee_id=${employeeId} user_id=${userId}`,
    );

    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    console.error(
      `[employees] create failed employee_id=${employeeId} user_id=${userId} error=${message}`,
    );

    return {
      success: false,
      error: message,
    };
  }
}

export async function updateEmployeeAction(
  _prevState: UpdateEmployeeState,
  formData: FormData,
): Promise<UpdateEmployeeState> {
  const currentEmployeeIdRaw = String(
    formData.get("employee_id_current") ?? "",
  ).trim();
  const newEmployeeIdRaw = String(formData.get("employee_id_new") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const lob = String(formData.get("lob") ?? "").trim();
  const employeeName = String(formData.get("employee_name") ?? "").trim();
  const userId = String(formData.get("user_id") ?? "").trim();
  const hireDate = String(formData.get("hire_date") ?? "").trim();
  const lastDayRaw = String(formData.get("last_day") ?? "").trim();

  if (
    !currentEmployeeIdRaw ||
    !newEmployeeIdRaw ||
    !company ||
    !lob ||
    !employeeName ||
    !userId ||
    !hireDate
  ) {
    return {
      success: false,
      error: "All fields are required, except last_day.",
    };
  }

  const currentEmployeeId = Number(currentEmployeeIdRaw);
  const newEmployeeId = Number(newEmployeeIdRaw);

  if (
    !Number.isInteger(currentEmployeeId) ||
    currentEmployeeId <= 0 ||
    !Number.isInteger(newEmployeeId) ||
    newEmployeeId <= 0
  ) {
    return {
      success: false,
      error: "employee_id values must be positive integers.",
    };
  }

  const lastDay = lastDayRaw.length > 0 ? lastDayRaw : null;

  try {
    await updateEmployee({
      employee_id_current: currentEmployeeId,
      employee_id_new: newEmployeeId,
      company,
      lob,
      employee_name: employeeName,
      user_id: userId,
      hire_date: hireDate,
      last_day: lastDay,
    });

    console.info(
      `[employees] update success from_id=${currentEmployeeId} to_id=${newEmployeeId} user_id=${userId}`,
    );

    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    console.error(
      `[employees] update failed from_id=${currentEmployeeId} to_id=${newEmployeeId} user_id=${userId} error=${message}`,
    );

    return {
      success: false,
      error: message,
    };
  }
}
