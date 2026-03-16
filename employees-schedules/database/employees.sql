CREATE TABLE employees (
  company       VARCHAR(255)  NOT NULL,
  employee_id   INT           NOT NULL,
  lob			VARCHAR(255)  NOT NULL,
  employee_name VARCHAR(255)  NOT NULL,
  user_id       VARCHAR(100)  NOT NULL,
  hire_date     DATE          NOT NULL,
  last_day      DATE,
  PRIMARY KEY (employee_id)
);

CREATE TABLE employee_schedules (
  id          SERIAL        PRIMARY KEY,
  employee_id INT           NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  weekday     VARCHAR(20)   NOT NULL CHECK (weekday IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  is_off      BOOLEAN       NOT NULL DEFAULT FALSE,
  start_time  TIME,
  end_time    TIME,
  work_hours  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, weekday)
);


INSERT INTO employees (company, employee_id, lob, employee_name, user_id, hire_date
)
VALUES 
('Best company', 11111, 'Sales', 'Alex Murphy', 'aMurphy', '2025-03-12'),
('Best company', 11112, 'Sales', 'Lex Luthor', 'lLuthor', '2024-04-15'),
('Best company', 11113, 'Sales', 'Leonel Messi', 'lMessi', '2015-02-01'),
('Best company', 11114, 'Care', 'John Smith', 'jSmith', '2023-12-09'),
('Best company', 11115, 'Care', 'Tony Stark', 'tStark', '2020-05-22'),
('Best company', 11116, 'Sales', 'John Connor', 'jConnor', '2026-02-02');

INSERT INTO employee_schedules (
  employee_id,
  weekday,
  is_off,
  start_time,
  end_time,
  work_hours
)
VALUES
  (11111, 'monday', false, '08:00', '17:30', 8.00),
  (11111, 'tuesday', false, '08:00', '17:30', 8.00),
  (11111, 'wednesday', false, '08:00', '17:30', 8.00),
  (11111, 'thursday', false, '08:00', '17:30', 8.00),
  (11111, 'friday', false, '08:00', '17:00', 7.50),
  (11111, 'saturday', true, NULL, NULL, 0),
  (11111, 'sunday', true, NULL, NULL, 0),

  (11114, 'monday', false, '09:00', '18:30', 8.00),
  (11114, 'tuesday', false, '09:00', '18:30', 8.00),
  (11114, 'wednesday', false, '09:00', '18:30', 8.00),
  (11114, 'thursday', false, '09:00', '18:30', 8.00),
  (11114, 'friday', false, '09:00', '18:00', 7.50),
  (11114, 'saturday', false, '08:00', '13:30', 4.00),
  (11114, 'sunday', true, NULL, NULL, 0),

  (11116, 'monday', false, '07:30', '16:30', 7.50),
  (11116, 'tuesday', false, '07:30', '16:30', 7.50),
  (11116, 'wednesday', false, '10:00', '19:30', 8.00),
  (11116, 'thursday', false, '10:00', '19:30', 8.00),
  (11116, 'friday', false, '07:30', '15:30', 6.50),
  (11116, 'saturday', true, NULL, NULL, 0),
  (11116, 'sunday', false, '08:00', '14:30', 5.00);

SELECT
  e.lob,
  e.employee_name,
  e.user_id,
  s.weekday,
  s.is_off,
  s.start_time,
  s.end_time,
  s.work_hours
FROM employee_schedules s
INNER JOIN employees e
  ON s.employee_id = e.employee_id
ORDER BY e.employee_name, s.weekday;