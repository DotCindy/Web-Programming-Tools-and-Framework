var empData = require("./data/employees.json");
var depData = require("./data/departments.json");
var fs = require("fs");

function initialize() {
    return new Promise(function(resolve, reject) {
        fs.readFile("./data/employees.json", function(err, data) {
            if (err) {
                reject("unable to read file");
            }
            else { 
                employees = JSON.parse(data);
            }
        });
        fs.readFile("./data/departments.json", function(err, data) {
            if (err) {
                reject("unable to read file");
            }
            else {
                departments = JSON.parse(data);
            }
        });
        resolve("operation was a success");
    });
}

module.exports.getAllEmployees = function() {
    return new Promise(function(resolve, reject) {
        empData.filter()
            .then(resolve(empData))
            .catch(reject("no results returned"));
    });
}

module.exports.getManagers = function() {
    return new Promise(function(resolve, reject) {
        empData.filter({
            where: { isManager: true}
        }).then(resolve(empData))
        .catch(reject("no results returned"));
    });
}

module.exports.getDepartments = function() {
    return new Promise(function(resolve, reject) {
        depData.filter()
        .then(resolve(data))
        .catch(reject("no results returned"));
    });
}
