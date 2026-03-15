import { getEmployees } from "@/lib/db";

export default async function Home() {
  const employees = await getEmployees().catch(() => []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-zinc-100 px-6 py-10">
      <h1 className="mb-8 text-4xl font-bold text-zinc-900">
        Employee schedules
      </h1>

      <div className="mb-8 flex gap-4">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
        >
          New employee
        </button>

        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700"
        >
          Update employee
        </button>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-zinc-800">Employees</h2>

        {employees.length === 0 ? (
          <p className="text-zinc-600">
            No employees found or database is not configured yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-700">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">LOB</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Hire date</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.employee_id}
                    className="border-b border-zinc-100"
                  >
                    <td className="py-2 pr-4">{employee.employee_id}</td>
                    <td className="py-2 pr-4">{employee.employee_name}</td>
                    <td className="py-2 pr-4">{employee.lob}</td>
                    <td className="py-2 pr-4">{employee.company}</td>
                    <td className="py-2 pr-4">{employee.hire_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
