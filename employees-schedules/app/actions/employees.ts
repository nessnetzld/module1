"use server";

// Server actions for employee record operations (create and update).
// "use server" marks every exported function as a Next.js Server Action,
// meaning they run only on the server and are callable directly from client components.

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

// Processes the new employee form submission.
// Validates that all required fields are present and that employee_id is a positive
// integer before calling insertEmployee to write the new row to the database.
// ASYNCHRONOUS FUNCTION: uses async/await to call the database insert function.
// HANDLING EXCEPTIONS: the try/catch block converts DB errors (duplicate key
// violations) into a user-visible error string returned inside the state object.
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

    // DISPLAY OUTPUT TO THE TERMINAL: logs the successful creation in the server
    // console so developers can trace new employee records being added over time.
    console.info(
      `[employees] create success employee_id=${employeeId} user_id=${userId}`,
    );

    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
    // HANDLING EXCEPTIONS: catches any Error thrown by insertEmployee (e.g. duplicate
    // employee_id) and extracts the message to return as a readable error to the user.
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    // DISPLAY OUTPUT TO THE TERMINAL: logs the failure details so developers can
    // investigate why the new employee record could not be saved.
    console.error(
      `[employees] create failed employee_id=${employeeId} user_id=${userId} error=${message}`,
    );

    return {
      success: false,
      error: message,
    };
  }
}

// Processes the update employee form submission.
// Validates both the current and new employee IDs plus all required fields before
// calling updateEmployee to apply the change to the existing DB row.
// ASYNCHRONOUS FUNCTION: uses async/await to call the database update function.
// HANDLING EXCEPTIONS: the try/catch block surfaces errors such as "Employee not found"
// that originate in the DB layer back to the user as a readable error message.
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

    // DISPLAY OUTPUT TO THE TERMINAL: records successful updates in the server logs
    // with both the old and new IDs so employee changes can be audited.
    console.info(
      `[employees] update success from_id=${currentEmployeeId} to_id=${newEmployeeId} user_id=${userId}`,
    );

    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
    // HANDLING EXCEPTIONS: catches any Error thrown by updateEmployee (e.g. "Employee
    // not found" when rowCount is 0) and converts it into a user-visible error string.
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error.";

    // DISPLAY OUTPUT TO THE TERMINAL: logs the failure with identifying context so
    // developers can diagnose failed employee update requests in the server logs.
    console.error(
      `[employees] update failed from_id=${currentEmployeeId} to_id=${newEmployeeId} user_id=${userId} error=${message}`,
    );

    return {
      success: false,
      error: message,
    };
  }
}
