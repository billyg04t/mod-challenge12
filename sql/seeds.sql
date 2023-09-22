INSERT INTO department (id, name) VALUES
  (1, 'HR'),
  (2, 'Sales'),
  (3, 'Engineering');

INSERT INTO role (id, title, salary, department_id) VALUES
  (1, 'HR Manager', 70000, 1),
  (2, 'Sales Associate', 50000, 2),
  (3, 'Software Engineer', 80000, 3),
  (4, 'Team Lead', 90000, 3);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES
  (1, 'John', 'Doe', 1, NULL),
  (2, 'Jane', 'Smith', 2, NULL),
  (3, 'Bob', 'Johnson', 3, 1),
  (4, 'Alice', 'Williams', 4, 3);