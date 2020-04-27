//required dependencies
var express = require("express");

//ports
var PORT = process.env.PORT || 3000;

//initiate express in server.js
var app = express ();

//express router
var router = express.Router();

//designate public folder as static directory
app.use(express.static(_dirname + "/public"));

//send request through router middleware
app.use(router);

//Listener
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
    });