import { getEmployeeScheduleRows, getEmployees } from "@/lib/db";
import NewEmployeeForm from "@/app/components/new-employee-form";
import UpdateEmployeeForm from "@/app/components/update-employee-form";
import EmployeeScheduleForm from "@/app/components/employee-schedule-form";
import SchedulesTable from "@/app/components/schedules-table";

export default async function Home() {
  let employees: Awaited<ReturnType<typeof getEmployees>> = [];
  let scheduleRows: Awaited<ReturnType<typeof getEmployeeScheduleRows>> = [];
  let loadError: string | null = null;

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
