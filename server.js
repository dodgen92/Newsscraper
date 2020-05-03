//required dependencies
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

var express = require("express");
var app = express ();

app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended:false
    })
);

app.use(express.static(process.cwd() + "/public"));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

mongoose.connect("mongofb://localhost/scraped_articles");
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
    console.log("Connected to Mongoose!");
});


//ports
var PORT = process.env.PORT || 3000;

//Listener
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
    });
