// Root page of the application. Server component — fetches all data on the server
// before the HTML is sent to the browser, so no loading spinners are needed.
import { getEmployeeScheduleRows, getEmployees } from "@/lib/db";
import NewEmployeeForm from "@/app/components/new-employee-form";
import UpdateEmployeeForm from "@/app/components/update-employee-form";
import EmployeeScheduleForm from "@/app/components/employee-schedule-form";
import SchedulesTable from "@/app/components/schedules-table";

// Entry-point server component for the "/" route.
// Fetches both the employee list and the schedule rows from the database at render time,
// then passes the results down to the interactive client components as props.
// ASYNCHRONOUS FUNCTION: declared with async so it can await the DB calls directly
// in the component body — a Next.js App Router server component feature.
// HANDLING EXCEPTIONS: wraps both DB calls in a single try/catch so a connectivity
// failure shows an inline error banner rather than crashing the entire page render.
export default async function Home() {
  let employees: Awaited<ReturnType<typeof getEmployees>> = [];
  let scheduleRows: Awaited<ReturnType<typeof getEmployeeScheduleRows>> = [];
  let loadError: string | null = null;

  // HANDLING EXCEPTIONS: if either DB call fails (e.g. database unreachable), the
  // error is caught here and stored as a string so the page still renders with the
  // forms available and an error banner at the bottom explaining the issue.
  try {
    employees = await getEmployees();
    scheduleRows = await getEmployeeScheduleRows();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unknown database error.";
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-zinc-100 px-6 py-10">
      <h1 className="mb-8 text-4xl font-bold text-zinc-900">
        Employee schedules
      </h1>

      <div className="mb-8 flex gap-4">
        <NewEmployeeForm />
        <UpdateEmployeeForm employees={employees} />
        <EmployeeScheduleForm employees={employees} />
      </div>

      <SchedulesTable rows={scheduleRows} />

      {loadError ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Database error: {loadError}
        </p>
      ) : null}
    </main>
  );
}
