DROP TABLE full_name;

CREATE TABLE full_name AS SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee;