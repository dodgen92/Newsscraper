//required dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebarss");
var bodyParser = require("body-parser");

//ports
var PORT = process.env.PORT || 3000;

//initiate express in server.js
var app = express ();

//express router
var router = express.Router();

//designate public folder as static directory
app.use(express.static(__dirname + "/public"));

//connect Handlebars to our Express app
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//use body-parser
app.use(bodyParser.urlencoded({
    extended: false
}));

//send request through router middleware
app.use(router);

//use deployed database if deployed, otherwise use local mongoHeadlines db
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

//connect mongoose to our db
mongoose.connect(db, function(error){
    //error log
    if (error) {
        console.log(error);
    }
    // success log
    else {
        console.log("mongoose connection is successful");
    }
});

//Listener
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
    });