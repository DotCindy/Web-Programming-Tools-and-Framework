/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Cindy Le            Student ID: 111657151           Date: Aug 3, 2018
*
* Online (Heroku) Link: https://shrouded-cove-59042.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const app = express();
const dataService = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");

const HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
  return new Promise(function(res, req) {
    dataService.initialize()
    .then(dataServiceAuth.initialize())
    .then(function(data) {
      app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT, onHttpStart)
      })
    })
    .catch(function(err){
      console.log("unable to start server: " + err);
    });
  })
}

const storage = multer.diskStorage( {
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null,Date,now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(express.static("public"));

app.use(function(req,res,next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" :route.replace(/\$/,"");
  next();
});

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(clientSessions({
  cookieName: "session",
  secret: "assign6_web322",
  duration: 2 * 60 * 1000,
  activeDuraction: 1000 * 60
}));

app.use(bodyParser.urlencoded({ extended: false }));

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

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  req.body.userAgent = req.get("User-Agent");
  dataServiceAuth.checkUser(req.body)
  .then(function(getUser) {
    req.session.user = {
      userName: getUser.userName,
      email: getUser.email,
      loginHistory: getUser.loginHistory
    };
    redirect("/employees");
  })
  .catch(function(err) {
    res.render("login", {
      errorMsg: err, userName: req.body.userName
    });
  });
})

app.get("/register", function(req, res) {
  res.render("register");
})

app.post("/register", function() {
  dataServiceAuth.registerUser(req.body)
  .then(function() {
    res.render("register", {
      successMessage: "User created"
    });
  })
  .catch(function(err) {
    res.render("register", {
      errorMessage: err, userName: req.body.userName
    });
  })
})

app.get("/logout", function(req, res) {
  res.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, function(req, res) {
  res.render("userHistory");
})

app.get("/employees", ensureLogin, function(req,res) {
  if (req.query.status) {
    dataService.getEmployeesByStatus(req.query.status)
    .then(function(data) {
      if(data.length > 0) {
        res.render("employees", { employees: data });
      }
    }).catch(function(err) {
      res.render("emplyees", { message: "no results" });
    });
  } else if (req.query.manager) {
    dataService.getEmployeesByManager(req.query.manager)
    .then(function(data) {
      if (data.length > 0) {
        res.render("employees", { employees: data });
      }
    }).catch(function(err) {
      res.render("employees", { message: "no results" });
    })
  } else if (req.query.department) {
    dataService.getEmployeesByDepartment(req.query.department)
    .then(function(data) {
      res.render("employees", { employees: data });
    }).catch(function(err) {
      res.render("employees", { message: "no results" });
    });
  } else {
    dataService.getAllEmployees()
    .then(function(data) {
      res.render("employees", { employees: data });
    }).catch(function(err) {
      res.render("employees", { message: "no results" });
    })
  }
});

app.get("/employees/add", ensureLogin, function(req,res) {
  dataService.getDepartments().then(function(data) {
    res.render("addEmployee", { deparments: data });
  }).catch(function(err) {
    res.render("addEmployee", { departments: [] });
  });
});

app.post("/employees/add", ensureLogin, function(req, res) {
  dataService.addEmployee(req.body).then(function(data) {
    res.redirect("/employees");
  }).catch(function(err) {
    res.status(500).send("Unable to Add Employee");
  })
});

  app.post("/employees/update", ensureLogin, function(req,res) {
    dataService.updateEmployee(req.body).then(function(data) {
      res.redirect("/employees");
    }).catch(function(err) {
      res.status(500).send("Unable to Update Employee");
    });
  });

  app.get("/employee/:empNum", ensureLogin, (req, res) => {
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

  app.get("/employees/delete/:empNum"), ensureLogin, function(req,res) {
    dataService.deleteEmployeeByNum(empNum).then(function(data) {
      res.redirect("/employees");
    }).catch(function(err) {
      res.status(500).send("Unable to Delete Employee");
    });
  }

  app.get("/departments", ensureLogin, function(req,res) {
    dataService.getDepartments().then(function(data) {
      res.render("departments", { departments: data });
    }).catch(function(err) {
      res.render("departments", { message: "error" });
    });
  });

  app.get("/departments/add", ensureLogin, function(req,res) {
    res.render("addDepartment");
  });

  app.post("/departments/add", ensureLogin, function(req,res) {
    dataService.addDepartment(req.body).then(function(data) {
      res.redirect("/departments");
    }).catch(function(err) {
      res.status(500).send("Unable to Add Department");
    })
  });

  app.post("/department/update", ensureLogin, function(req,res) {
    dataService.updateDepartment(req.body).then(function(data) {
      res.redirect("/departments");
    }).catch(function(err) {
      res.status(500).send("Unable to Update Department");
    })
  })

  app.get("/department/:departmentId",ensureLogin, function(req, res) {
    dataService.getDepartmentById(req.params.departmentId).then(function(data) {
      res.render("department", {
        data: data
      });
    }).catch(function(err) {
      res.status(404).send("Department Not Found");
    });
  });

app.get("/images", ensureLogin, function(req,res) {
  fs.readdir("./public/images/uploaded/", function(err, items) {
    res.render("images", {
      data: items
    })
  })
});

app.get("/images/add", ensureLogin, function(req,res) {
  res.render("addImages");
});

app.post("/images/add", upload.single("imageFile"), ensureLogin, function(req,res) {
  res.redirect("/images");
});

app.use(function(req,res) {
  res.status(404).send("Page Not Found");
});

  // setup http server to listen on HTTP_PORT
  //app.listen(HTTP_PORT, onHttpStart);
