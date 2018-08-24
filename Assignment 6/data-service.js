const Sequelize = require('sequelize');

var sequelize = new Sequelize('d639thqce64r0d', 'oazykcuobvtnin', '5b2232bdf113c7e5b5c3a5768d1ea8eef5dccd951bcbdbae0f8767f8c3dd165e', {
    host: 'ec2-23-21-238-28.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    },
    operatorsAliases: false,
    logging: false
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

const Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    martialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
    }, {
    createdAt: false,
    updatedAt: false,
});

const Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
    }, {
        createdAt: false,
        updatedAt: false,
});

module.exports.initialize = function() {
    return new Promise(function(resolve, reject) {
        sequelize.sync().then(function(Employee) { 
            resolve(); 
        }).then(function(Department) {
            resolve();
        }).catch(function(err) { 
            reject('unable to sync the database'); 
        });
    });
}

module.exports.getAllEmployees = function() {
    return new Promise(function(resolve, reject) {
        Employee.findAll().then(function(data) { 
            resolve(data); 
        }).catch(function(err) { 
            reject('no results returned'); 
        });
    })
}

module.exports.getEmployeesByStatus = function(status) {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Employee.findAll({
                where: { status: status }
            }));
        }).catch(function(err) {
            reject("no results returned");
        })
    });
}

module.exports.getEmployeesByDepartment = function(department) {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Employee.findAll({
                where: { department: department }
            }));
        }).catch(function(err) {
            reject("no results returned");
        })
    });
}

module.exports.getEmployeesByManager = function(manager) {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Employee.findAll({
                where: { employeeManagerNum: manager }
            }));
        }).catch(function(err) {
            reject("no results returned");
        })
    });
}

module.exports.getEmployeesByNum = function(num) {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Employee.findAll({
                where: { employeeNum: num }
            }));
        }).catch(function(err) {
            reject("no results returned");
        })
    });
}

module.exports.getDepartments = function() {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Department.findAll({
            }))
        }).catch(function(err) {
            reject("no results returned");
        })
    });
}

module.exports.addEmployee = function(employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            for (var i; i < employeeData; i++) {
                if (employeeData[i] == "") {
                    employeeData[i] = null;
                }
            }
            resolve(Employee.create( {
                employeeNum: employeeData.employeeNum,
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressPostal: employeeData.addressPostal,
                martialStatus: employeeData.martialStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            }))
        }).catch(function(err) {
            reject("unable to create employee");
        })
    })
}

module.exports.updateEmployee = function(employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            for (var i; i < employeeData; i++) {
                if (employeeData[i] == "") {
                    employeeData[i] = null;
                }
            }
            resolve(Employee.update( {
                employeeNum: employeeData.employeeNum,
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressPostal: employeeData.addressPostal,
                martialStatus: employeeData.martialStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate },
                { where: { employeeNum : employeeData.employeeNum }
            }))
        }).catch(function(err) {
            reject("unable to create employee");
        })
    })
}

module.exports.deleteEmployeeByNum = function(empNum) {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Employee.destroy( { 
                where: { employeeNum: num }
            }));
        }).catch(function(err) {
            reject('unable to delete employee');
        })
    })
}

module.exports.addDepartment = function(departmentData) {
    return new Promisef(function(resolve, reject) {
        for (var i; i < departmentData; i++) {
            if (departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        })
        .then(function() {
            resolve(Department);
        }).catch(function(err) {
            reject('unable to create department');
        })
    })
}

module.exports.updateDepartment = function(departmentData) {
    return new Promise(function(resolve, reject) {
        for (var i; i < departmentData[i]; i++) {
            if (departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.update( {
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        },
        { where: { departmentId: departmentData.departmentId }
        }).then(function(data) {
            resolve(Department);
        }).catch(function() { 
            reject('unable to update department');
        })
    })
}

module.exports.getDepartmentById = function(id) {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(function() {
            resolve(Department.findAll({ 
                where: { departmentId: id }
            }))
        }).catch(function(err) {
            reject('no results returned');
        })
    })
}
