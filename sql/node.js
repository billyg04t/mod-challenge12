const dotenv = require('dotenv');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const util = require('util');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const queryAsync = util.promisify(connection.query).bind(connection);

async function startApp() {
  const answer = await inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit',
    ],
  });

  switch (answer.action) {
    case 'View all departments':
      await viewDepartments();
      break;
    case 'View all roles':
      await viewRoles();
      break;
    case 'View all employees':
      await viewEmployees();
      break;
    case 'Add a department':
      await addDepartment();
      break;
    case 'Add a role':
      await addRole();
      break;
    case 'Add an employee':
      await addEmployee();
      break;
    case 'Update an employee role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      connection.end();
      break;
  }
}

async function viewDepartments() {
  const departments = await queryAsync('SELECT * FROM department');
  console.table(departments);
  startApp();
}

async function viewRoles() {
  const roles = await queryAsync(
    'SELECT role.id, role.title, role.salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id'
  );
  console.table(roles);
  startApp();
}

async function viewEmployees() {
  const employees = await queryAsync(
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id'
  );
  console.table(employees);
  startApp();
}

async function addDepartment() {
  const answer = await inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:',
  });

  await queryAsync('INSERT INTO department SET ?', { name: answer.name });
  console.log('Department added successfully!');
  startApp();
}

async function addRole() {
  const answers = await inquirer.prompt([
    {
      name: 'title',
      type: 'input',
      message: 'Enter the title of the role:',
    },
    {
      name: 'salary',
      type: 'input',
      message: 'Enter the salary for the role:',
    },
    {
      name: 'departmentId',
      type: 'input',
      message: 'Enter the department ID for the role:',
    },
  ]);

  await queryAsync('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [
    answers.title,
    answers.salary,
    answers.departmentId,
  ]);
  console.log('Role added successfully!');
  startApp();
}

async function addEmployee() {
  const answers = await inquirer.prompt([
    {
      name: 'firstName',
      type: 'input',
      message: "Enter the employee's first name:",
    },
    {
      name: 'lastName',
      type: 'input',
      message: "Enter the employee's last name:",
    },
    {
      name: 'roleId',
      type: 'input',
      message: "Enter the employee's role ID:",
    },
    {
      name: 'managerId',
      type: 'input',
      message: "Enter the employee's manager ID:",
    },
  ]);

  await queryAsync('INSERT INTO employee SET ?', {
    first_name: answers.firstName,
    last_name: answers.lastName,
    role_id: answers.roleId,
    manager_id: answers.managerId,
  });
  console.log('Employee added successfully!');
  startApp();
}

async function updateEmployeeRole() {
  const employees = await queryAsync('SELECT * FROM employee');
  const employeeChoices = employees.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const answers = await inquirer.prompt([
    {
      name: 'employeeId',
      type: 'list',
      message: 'Select an employee to update:',
      choices: employeeChoices,
    },
    {
      name: 'roleId',
      type: 'input',
      message: 'Enter the new role ID for the employee:',
    },
  ]);

  await queryAsync('UPDATE employee SET ? WHERE ?', [
    { role_id: answers.roleId },
    { id: answers.employeeId },
  ]);
  console.log('Employee role updated successfully!');
  startApp();
}

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
  
  // Specify the database you want to use
  connection.query('USE company_db', (useErr, useResults) => {
    if (useErr) throw useErr;

    // Start the application after selecting the database
    startApp();
  });
});
