# Employee Schedules

Next.js + TypeScript app connected to PostgreSQL.

## 1) Configure environment variables

Create a local env file based on the example:

```bash
cp .env.example .env.local
```

If you are on PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Update `.env.local` with your PostgreSQL credentials.

You can use either:

- `DATABASE_URL` (recommended), or
- split variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

If `DATABASE_URL` is set, the app will use it first.

## 2) Create database and tables

Create a database named `employees_db` and run:

```sql
database/employees.sql
```

This script creates tables `employees` and `employee_schedules`, then inserts sample employees.

## 3) Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If the connection is valid, the home page will show employees from PostgreSQL.
