/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Cindy Le            Student ID: 111657151           Date: Jul 6, 2018
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

//var empData = require("./data/employees.json");
app.get("/employees", function(req,res) {
  //res.json(empData);
  dataService.getAllEmployees()
  .then(function(data) {
    res.render("employees", { employees: data });
  });
});

app.get("/employees/add", function(req,res) {
  res.render("addEmployee");
});

app.post("/employees/add",  function(req, res) {
  dataService.addEmployee(req.body).then(function(data) {
    console.log(req.body);
    res.redirect("/employees");
  }).catch(function(err) {
    console.log(err);
  })
});

app.post("/employees/update", function(req,res) {
  dataService.updateEmployee(req.body).then(function(data) {
    console.log(req.body);
    res.redirect("/employees");
  }).catch(function(err) {
    console.log(err);
  })
});

app.get("/employee/:empNum", function(req, res) {
  dataService.getEmployeeByNum(req.params.empNum)
      .then(function(data) {
      res.render("employee", { employee: data });
  }).catch(function(err) {
      res.render("employee", { message:"no results"});
  });
});

//var depData = require("./data/departments.json");
app.get("/departments", function(req,res) {
  //res.json(depData);
  dataService.getDepartments()
  .then(function(data) {
    res.render("departments", { departments: data });
  });
});

app.get("/images", function(req,res) {
  var pathImages = "./public/images/uploaded";
  fs.readdir(pathImages, function(err, items) {
    for (var i = 0; i < items.length; i++) {
      var file = path + "/" + items[i];
      res.json(items);
    }
  })
});

app.get("/images/add", function(req,res) {
  res.render("addImages");
});

app.post("/images/add", upload.single("imageFile"), (req,res) => {
  res.send("/images");
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
