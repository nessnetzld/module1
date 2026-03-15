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


INSERT INTO employees (company, employee_id, lob, employee_name, user_id, hire_date
)
VALUES 
('Best company', 11111, 'Sales', 'Alex Murphy', 'aMurphy', '2025-03-12'),
('Best company', 11112, 'Sales', 'Lex Luthor', 'lLuthor', '2024-04-15'),
('Best company', 11113, 'Sales', 'Leonel Messi', 'lMessi', '2015-02-01'),
('Best company', 11114, 'Care', 'John Smith', 'jSmith', '2023-12-09'),
('Best company', 11115, 'Care', 'Tony Stark', 'tStark', '2020-05-22'),
('Best company', 11116, 'Sales', 'John Connor', 'jConnor', '2026-02-02');

SELECT * FROM employees;