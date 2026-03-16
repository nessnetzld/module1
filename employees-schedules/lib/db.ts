import { Pool } from "pg";

declare global {
  var pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new Pool({
      connectionString,
    });
  }

  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;

  if (!host || !port || !user || !password || !database) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL or POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB.",
    );
  }

  return new Pool({
    host,
    port: Number(port),
    user,
    password,
    database,
  });
}

export const db = global.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.pgPool = db;
}

export type schedules = {
  company: string;
  employee_id: number;
  lob: string;
  employee_name: string;
  user_id: string;
  hire_date: string;
  last_day: string | null;
};

export type NewEmployeeInput = {
  company: string;
  employee_id: number;
  lob: string;
  employee_name: string;
  user_id: string;
  hire_date: string;
};

export type UpdateEmployeeInput = {
  employee_id_current: number;
  employee_id_new: number;
  company: string;
  lob: string;
  employee_name: string;
  user_id: string;
  hire_date: string;
  last_day: string | null;
};

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type EmployeeScheduleDayInput = {
  weekday: Weekday;
  is_off: boolean;
  start_time: string | null;
  end_time: string | null;
  work_hours: number;
};

export type EmployeeWeeklyScheduleInput = {
  employee_id: number;
  days: EmployeeScheduleDayInput[];
};

export type DayScheduleView = {
  is_off: boolean;
  start_time: string | null;
  end_time: string | null;
  work_hours: number;
};

export type EmployeeScheduleTableRow = {
  employee_id: number;
  employee_name: string;
  user_id: string;
  days: Record<Weekday, DayScheduleView>;
};

type Queryable = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

type ScheduleColumnNames = {
  dayColumn: "weekday" | "day_of_week";
  hoursColumn: "work_hours" | "total_hours";
};

async function getScheduleColumnNames(
  dbOrClient: Queryable,
): Promise<ScheduleColumnNames> {
  const result = await dbOrClient.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'employee_schedules'
        AND column_name IN ('weekday', 'day_of_week', 'work_hours', 'total_hours')
    `,
  );

  const columnNames = new Set(
    result.rows.map((row) =>
      String((row as { column_name: string }).column_name),
    ),
  );

  const dayColumn = columnNames.has("weekday")
    ? "weekday"
    : columnNames.has("day_of_week")
      ? "day_of_week"
      : null;

  const hoursColumn = columnNames.has("work_hours")
    ? "work_hours"
    : columnNames.has("total_hours")
      ? "total_hours"
      : null;

  if (!dayColumn || !hoursColumn) {
    throw new Error(
      "employee_schedules columns are not compatible. Expected weekday/day_of_week and work_hours/total_hours.",
    );
  }

  return {
    dayColumn,
    hoursColumn,
  };
}

export async function getEmployees(): Promise<schedules[]> {
  const { rows } = await db.query<schedules>(`
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

export async function insertEmployee(input: NewEmployeeInput): Promise<void> {
  await db.query(
    `
      INSERT INTO employees (
        company,
        employee_id,
        lob,
        employee_name,
        user_id,
        hire_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      input.company,
      input.employee_id,
      input.lob,
      input.employee_name,
      input.user_id,
      input.hire_date,
    ],
  );
}

export async function updateEmployee(
  input: UpdateEmployeeInput,
): Promise<void> {
  const result = await db.query(
    `
      UPDATE employees
      SET
        company = $1,
        employee_id = $2,
        lob = $3,
        employee_name = $4,
        user_id = $5,
        hire_date = $6,
        last_day = $7
      WHERE employee_id = $8
    `,
    [
      input.company,
      input.employee_id_new,
      input.lob,
      input.employee_name,
      input.user_id,
      input.hire_date,
      input.last_day,
      input.employee_id_current,
    ],
  );

  if (result.rowCount === 0) {
    throw new Error("Employee not found.");
  }
}

export async function upsertEmployeeWeeklySchedule(
  input: EmployeeWeeklyScheduleInput,
): Promise<void> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const { dayColumn, hoursColumn } = await getScheduleColumnNames(client);

    for (const day of input.days) {
      await client.query(
        `
          INSERT INTO employee_schedules (
            employee_id,
            ${dayColumn},
            is_off,
            start_time,
            end_time,
            ${hoursColumn}
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (employee_id, ${dayColumn})
          DO UPDATE SET
            is_off = EXCLUDED.is_off,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            ${hoursColumn} = EXCLUDED.${hoursColumn},
            updated_at = NOW()
        `,
        [
          input.employee_id,
          day.weekday,
          day.is_off,
          day.start_time,
          day.end_time,
          day.work_hours,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteEmployeeWeeklySchedule(
  employeeId: number,
): Promise<void> {
  await db.query(
    `
      DELETE FROM employee_schedules
      WHERE employee_id = $1
    `,
    [employeeId],
  );
}

type RawScheduleRow = {
  employee_id: number;
  employee_name: string;
  user_id: string;
  weekday: Weekday;
  is_off: boolean;
  start_time: string | null;
  end_time: string | null;
  work_hours: string | number;
};

function createEmptyDaySchedule(): DayScheduleView {
  return {
    is_off: false,
    start_time: null,
    end_time: null,
    work_hours: 0,
  };
}

function createEmptyWeek(): Record<Weekday, DayScheduleView> {
  return {
    monday: createEmptyDaySchedule(),
    tuesday: createEmptyDaySchedule(),
    wednesday: createEmptyDaySchedule(),
    thursday: createEmptyDaySchedule(),
    friday: createEmptyDaySchedule(),
    saturday: createEmptyDaySchedule(),
    sunday: createEmptyDaySchedule(),
  };
}

export async function getEmployeeScheduleRows(): Promise<
  EmployeeScheduleTableRow[]
> {
  const { dayColumn, hoursColumn } = await getScheduleColumnNames(db);

  const { rows } = await db.query<RawScheduleRow>(`
    SELECT
      e.employee_id,
      e.employee_name,
      e.user_id,
      s.${dayColumn} AS weekday,
      s.is_off,
      s.start_time::text,
      s.end_time::text,
      s.${hoursColumn} AS work_hours
    FROM employee_schedules s
    INNER JOIN employees e ON e.employee_id = s.employee_id
    ORDER BY
      e.employee_id ASC,
      CASE s.${dayColumn}
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 7
        ELSE 8
      END ASC
  `);

  const grouped = new Map<number, EmployeeScheduleTableRow>();

  for (const row of rows) {
    if (!grouped.has(row.employee_id)) {
      grouped.set(row.employee_id, {
        employee_id: row.employee_id,
        employee_name: row.employee_name,
        user_id: row.user_id,
        days: createEmptyWeek(),
      });
    }

    const item = grouped.get(row.employee_id);

    if (!item) {
      continue;
    }

    item.days[row.weekday] = {
      is_off: row.is_off,
      start_time: row.start_time,
      end_time: row.end_time,
      work_hours: Number(row.work_hours),
    };
  }

  return Array.from(grouped.values());
}
