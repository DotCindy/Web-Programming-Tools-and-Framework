/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Cindy Le            Student ID: 111657151           Date: Jul 17, 2018
*
* Online (Heroku) Link: https://shrouded-cove-59042.herokuapp.com/
*
********************************************************************************/

var express = require("express");
var app = express();
var dataService = require("./data-service.js");
var path = require("path");
var multer = require("multer");
var fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
  return new Promise(function(res, req) {
    dataService.initialize().then(function(data) {
      console.log(data)
    }).catch(function(err) {
      console.log(err);
    });
  });
}

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage( {
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null,Date,now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(function(req,res,next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" :route.replace(/\$/,"");
  next();
});

app.engine(".hbs", exphbs({ extname: ".hbs",
defaultLayout: 'main',
helpers: {
  navLink: function(url, options) {
    return '<li' +
    ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
    '><a href="' + url + '">' + options.fn(this) + '</a></li>';
  },
  equal: function(lvalue, rvalue, options) {
    if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
    return options.inverse(this);
    } else {
    return options.fn(this);
    }
  }
}}));

app.set("view engine", ".hbs");

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res) {
  res.render("home");
});

// setup another route to listen on /about
app.get("/about", function(req,res) {
  res.render("about");
});

app.get("/employees", function(req,res) {
  dataService.getAllEmployees().then(function(data) {
    res.render("employees", { message: "no results" });
  });
});

  app.get("/employees/add", function(req,res) {
    dataService.getDepartments().then(function(data) {
      res.render("addEmployee", { deparments: data });
    }).catch(function(err) {
      res.render("addEmployee", { departments: [] });
    });
  });

  app.post("/employees/add",  function(req, res) {
    dataService.addEmployee(req.body).then(function(data) {
      res.redirect("/employees");
    }).catch(function(err) {
      res.status(500).send("Unable to Add Employee");
    })
  });

  app.post("/employees/update", function(req,res) {
    dataService.updateEmployee(req.body).then(function(data) {
      res.redirect("/employees");
    }).catch(function(err) {
      res.status(500).send("Unable to Update Employee");
    });
  });

  app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(dataService.getDepartments)
    .then((data) => {
        viewData.departments = data;  // store department data in the "viewData" object as "departments"
                                      // loop through viewData.departments and once we have found the departmentId that matches
                                      // the employee's "department" value, add a "selected" property to the matching 
                                      // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
  });

  app.get("/employees/delete/:empNum"), function(req,res) {
    dataService.deleteEmployeeByNum(empNum).then(function(data) {
      res.redirect("/employees");
    }).catch(function(err) {
      res.status(500).send("Unable to Delete Employee");
    });
  }

  app.get("/departments", function(req,res) {
    dataService.getDepartments().then(function(data) {
      res.render("departments", { departments: data });
    }).catch(function(err) {
      res.render("departments", { message: "error" });
    });
  });

  app.get("/departments/add", function(req,res) {
    res.render("addDepartment");
  });

  app.post("/departments/add", function(req,res) {
    dataService.addDepartment(req.body).then(function(data) {
      res.redirect("/departments");
    }).catch(function(err) {
      res.status(500).send("Unable to Add Department");
    })
  });

  app.post("/department/update", function(req,res) {
    dataService.updateDepartment(req.body).then(function(data) {
      res.redirect("/departments");
    }).catch(function(err) {
      res.status(500).send("Unable to Update Department");
    })
  })

  app.get("/department/:departmentId", function(req, res) {
    dataService.getDepartmentById(req.params.departmentId).then(function(data) {
      res.render("department", {
        data: data
      });
    }).catch(function(err) {
      res.status(404).send("Department Not Found");
    });
  });

app.get("/images", function(req,res) {
  fs.readdir("./public/images/uploaded/", function(err, items) {
    res.render("images", {
      data: items
    })
  })
});

app.get("/images/add", function(req,res) {
  res.render("addImages");
});

app.post("/images/add", upload.single("imageFile"), function(req,res) {
  res.redirect("/images");
});

  app.use(function(req,res) {
    res.status(404).send("Page Not Found");
  });

  dataService.initialize().then(function() {
    app.listen(HTTP_PORT, function() {
      console.log("app listening on: " + HTTP_PORT)
    });
  }).catch(function(err) {
    console.log("unable to start server: " + err);
  });

  // setup http server to listen on HTTP_PORT
  //app.listen(HTTP_PORT, onHttpStart);
