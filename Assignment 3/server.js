/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Cindy Le            Student ID: 111657151           Date: Jun 15, 2018
*
* Online (Heroku) Link: https://gentle-island-98942.herokuapp.com/
*
********************************************************************************/

var express = require("express");
var app = express();
var dataService = require("./data-service.js");
var path = require("path");
var multer = require("multer");
var fs = require("fs");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

var HTTP_PORT = process.env.PORT || 8080;

const storage = multer.diskStorage( {
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null,Date,now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res) {
  res.sendFile(path.join(__dirname,"/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", function(req,res) {
  res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/employees/add", function(req,res) {
  res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
});

app.get("/images/add", function(req,res) {
  res.sendFile(path.join(__dirname,"/views/addImage.html"))
});

//var empData = require("./data/employees.json");
app.get("/employees", function(req,res) {
  //res.json(empData);
  dataService.getAllEmployees()
  .then(function(data) {
    res.json(data);
  });
});

app.get("/managers", function(req,res) {
  //res.send("TODO:");
  dataService.getManagers()
  .then(function(data) {
    res.json(data);
  });
});

//var depData = require("./data/departments.json");
app.get("/departments", function(req,res) {
  //res.json(depData);
  dataService.getDepartments()
  .then(function(data) {
    res.json(data);
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

app.post("/images/add", upload.single("imageFile"), (req,res) => {
  res.send("/images");
});

app.post("/employees/add",  function(req, res) {
  dataService.addEmployee(req.body).then(function(data) {
    console.log(req.body);
    res.redirect("/employees");
  }).catch((err) => {
    console.log(err);
  })
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
