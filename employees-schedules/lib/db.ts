import { Pool } from "pg";

declare global {
  var pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new Pool({
    connectionString,
  });
}

export const db = global.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.pgPool = db;
}

export type Employee = {
  company: string;
  employee_id: number;
  lob: string;
  employee_name: string;
  user_id: string;
  hire_date: string;
  last_day: string | null;
};

export async function getEmployees(): Promise<Employee[]> {
  const { rows } = await db.query<Employee>(`
    SELECT
      company,
      employee_id,
      lob,
      employee_name,
      user_id,
      hire_date::text,
      last_day::text
    FROM employees
    ORDER BY employee_id ASC
  `);

  return rows;
}
