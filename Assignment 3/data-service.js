let employees = [];
let departments = [];
var fs = require("fs");

module.exports.initialize = function () {
    return new Promise(function(resolve, reject) {
        fs.readFile("./data/departments.json", function(err, data) {
            if (err) {
                reject("unable to read file");
            }
            departments = JSON.parse(data);
            fs.readFile("./data/employees.json", function(err, data) {
                if (err) {
                    reject("unable to read file");
                } else {
                employees = JSON.parse(data);
                resolve("operation was a success");
                }
            });
        });
    });
}

module.exports.getAllEmployees = function() {
    return new Promise(function(resolve, reject) {
        if (employees.length == 0) {
            reject("no results returned");
        }
        resolve(employees);
    })
}

module.exports.getManagers = function() {
    return new Promise(function(resolve, reject) {
        var filterManagers = [];

        for (let i = 0; i < employees.length; i++) {
            if (employees[i].isManager == true) {
                filterManagers.push(employees[i]);
            }
        }
        if (filterManagers.length == 0) {
            reject("no results returned");
        }
        resolve(filterManagers);
    });
};

module.exports.getDepartments = function() {
    return new Promise(function(resolve, reject) {
        if (departments.length == 0) {
            reject("no results returned");
        }
        resolve(departments);
    });
}

module.exports.addEmployee = function(employeeData) {
    if (employeeData.isManager == undefined) {
        return false;
    }
    else {
        return true;
    }
    employeeData.employeeNum = employees.length + 1;
    return new Promise(function(resolve, reject) {
        employees.push(employeeData);
        if (employees.length == 0) {
            reject("no results returned");
        }
        resolve(employees);
    });
}
