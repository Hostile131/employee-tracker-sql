const cTable = require('console.table');
const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: '',
      database: 'tracker_db'
    },
    console.log(`Connected to the tracker_db database.\nWelcome to the Employee Tracker!`)
  );

  const trackerApp = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'mainMenu',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department'
            ]
        },
        {
            type: 'input',
            name: 'addEmployeeFirst',
            message: "What is the employee's first name?",
            when(answers) {
                return answers.mainMenu === 'Add Employee'
            }
        },
        {
            type: 'input',
            name: 'addEmployeeLast',
            message: "What is the employee's last name?",
            when(answers) {
                return answers.mainMenu === 'Add Employee'
            }
        },
        {
            type: 'list',
            name: 'addEmployeeRole',
            message: "What is the employee's role?",
            // make this menu reference the database
            choices: [
                'role 1',
                'role 2'
            ],
            when(answers) {
                return answers.mainMenu === 'Add Employee'
            }
        },
        {
            type: 'list',
            name: 'addEmployeeManager',
            message: "Who is the employee's manager?",
            // make this menu reference the database AND a 'none' NULL value
            choices: [
                'none',
                'manager 1',
                'manager 2'
            ],
            when(answers) {
                return answers.mainMenu === 'Add Employee'
            }
        },
        {
            type: 'list',
            name: 'updateEmployeeRoleSelect',
            message: "Which employee's role do you want to update?",
            // make this menu reference the database
            choices: [
                'employee 1',
                'employee 2'
            ],
            when(answers) {
                return answers.mainMenu === 'Update Employee Role'
            }
        },
        {
            type: 'list',
            name: 'updateEmployeeRoleAssign',
            message: "Which role do you want to assign to the selected employee?",
            // make this menu reference the database
            choices: [
                'role 1',
                'role 2'
            ],
            when(answers) {
                return answers.mainMenu === 'Update Employee Role'
            }
        },
        {
            type: 'input',
            name: 'addRole',
            message: 'What is the name of the role?',
            when(answers) {
                return answers.mainMenu === 'Add Role'
            }
        },
        {
            type: 'input',
            name: 'addRoleSalary',
            message: 'What is the salary of the role?',
            when(answers) {
                return answers.mainMenu === 'Add Role'
            }
        },
        {
            type: 'list',
            name: 'addRoleDepartment',
            message: 'Which department does this role belong to?',
            choices: [
                // make this menu reference the database
                'dept 1',
                'dept 2'
            ],
            when(answers) {
                return answers.mainMenu === 'Add Role'
            }
        },
        {
            type: 'input',
            name: 'addDepartment',
            message: 'What would you like to call the new department?',
            when(answers) {
                return answers.mainMenu === 'Add Department'
            }
        }
    ])
    .then((answers) => {
        console.log(`This is what you chose:\n${answers.mainMenu}`)
        return trackerApp();
    })
    .catch((err) => {
        console.log(err);
    });
};

trackerApp();