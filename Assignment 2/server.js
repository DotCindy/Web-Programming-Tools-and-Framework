/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Cindy Le            Student ID: 111657151           Date: May 21, 2018
*
* Online (Heroku) Link: https://shrouded-cove-59042.herokuapp.com/
*
********************************************************************************/

var dataService = require("./data-service.js");
var path = require("path");

var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

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

var empData = require("./data/employees.json");
app.get("/employees", function(req,res) {
  //res.json(empData);
  dataService.getAllEmployees()
  .then(res.json(empData));
});

app.get("/managers", function(req,res) {
  //res.send("TODO:");
  dataService.getManagers()
  .then(res.json(empData));
});

var depData = require("./data/departments.json");
app.get("/departments", function(req,res) {
  //res.json(depData);
  dataService.getDepartments()
  .then(res.json(depData));
});

app.use(function(req,res) {
  res.status(404).send("Page Not Found");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
