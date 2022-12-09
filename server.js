const cTable = require('console.table');
const fs = require('fs');
// const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

// const PORT = process.env.PORT || 3001;
// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: '',
      database: 'tracker_db'
    }
  );

console.log('Welcome to the Employee Tracker!')

  const trackerApp = () => {
    const roleChoices = [];
    const employeeChoices = [];
    const departmentChoices = [];
    db.query("SELECT * FROM role", function (err, data) {
        if (err) throw err;
        for (i = 0; i < data.length; i++) {
            roleChoices.push(data[i].title)
        }
    });
    db.query("SELECT * FROM employee", function (err, data) {
        if (err) throw err;
        for (i = 0; i < data.length; i++) {
            employeeChoices.push(data[i].first_name + " " + data[i].last_name)
        }
    });
    db.query("SELECT * FROM department", function (err, data) {
        if (err) throw err;
        for (i = 0; i < data.length; i++) {
            departmentChoices.push(data[i].name)
        }
    });
    console.log('Here is a console log.')
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
            choices: roleChoices,
            when(answers) {
                return answers.mainMenu === 'Add Employee'
            }
        },
        {
            type: 'list',
            name: 'addEmployeeManager',
            message: "Who is the employee's manager?",
            // make this menu reference the database AND a 'none' NULL value
            choices: employeeChoices,
            when(answers) {
                return answers.mainMenu === 'Add Employee'
            }
        },
        {
            type: 'list',
            name: 'updateEmployeeRoleSelect',
            message: "Which employee's role do you want to update?",
            choices: employeeChoices,
            when(answers) {
                return answers.mainMenu === 'Update Employee Role'
            }
        },
        {
            type: 'list',
            name: 'updateEmployeeRoleAssign',
            message: "Which role do you want to assign to the selected employee?",
            choices: roleChoices,
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
            validate: (answer) => {
                if (isNaN(answer)) {
                    return "Please delete your input and enter a valid number.";
                }
                return true;
            },
            when(answers) {
                return answers.mainMenu === 'Add Role'
            }
        },
        {
            type: 'list',
            name: 'addRoleDepartment',
            message: 'Which department does this role belong to?',
            choices: departmentChoices,
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
        console.log(`This is what you chose:\n${answers.mainMenu}`);
        if (answers.mainMenu === 'View All Departments') {
            const sql = `SELECT id, name FROM department`;
            db.query(sql, function(err, results) {
                console.table("\n", results);
            });
        } else if (answers.mainMenu === 'View All Roles') {
            const sql = `SELECT role.id AS id, role.title AS title, department.name AS department, role.salary AS salary FROM role JOIN department ON role.department_id = department.id`;

            db.query(sql, function(err, results) {
                console.table("\n", results);
            });
        } else if (answers.mainMenu === 'View All Employees') {
            const sql = `SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT(employee.first_name, ' ', employee.last_name) AS full_name FROM role JOIN department ON role.department_id = department.id JOIN employee ON role.id = employee.role_id;`;

            db.query(sql, function(err, results) {
                console.table("\n", results);
            });
        } else if (answers.mainMenu === 'Add Department') {
            console.log(answers.addDepartment);
            const sql = `INSERT INTO department (name) VALUES ("${answers.addDepartment}");`;
            db.query(sql);            
        } else if (answers.mainMenu === 'Add Role') {
            const sql = `SELECT id FROM department WHERE name = '${answers.addRoleDepartment}';`;
            db.query(sql, function(err, results) {
                console.log(results[0].id);
                const sql = `INSERT INTO role (title, salary, department_id) VALUES ("${answers.addRole}", "${answers.addRoleSalary}", "${results[0].id}");`;
                db.query(sql);
            });
        } else if (answers.mainMenu === 'Update Employee Role') {
            const nameArray = answers.updateEmployeeRoleSelect.split(" ");
            const sql = `SELECT id FROM employee WHERE first_name = '${nameArray[0]}' AND last_name = '${nameArray[1]}';`;
            db.query(sql, function(err, results) {
                const empID = results[0].id;
                const sql = `SELECT id FROM role WHERE title = '${answers.updateEmployeeRoleAssign}';`;
                db.query(sql, function(err, res) {
                    const roleID = res[0].id;
                    const sql = `UPDATE employee SET role_id = ${roleID} WHERE id = ${empID};`;
                    db.query(sql);
                })
            })
        } else if (answers.mainMenu === 'Add Employee') {
            const nameArray2 = answers.addEmployeeManager.split(" ");
            const sql = `SELECT id FROM employee WHERE first_name = '${nameArray2[0]}' AND last_name = '${nameArray2[1]}';`;
            db.query(sql, function(err, results) {
                const manID = results[0].id;
                const sql = `SELECT id FROM role WHERE title = '${answers.addEmployeeRole}';`;
                db.query(sql, function(err, res) {
                    const roleID = res[0].id;
                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${answers.addEmployeeFirst}", "${answers.addEmployeeLast}", ${roleID}, ${manID});`;
                    db.query(sql);
                })
            })
        }
        
        return trackerApp();
    })
    .catch((err) => {
        console.log(err);
    });
};

trackerApp();