//Load express module with `require` directive
var express = require('express')
var app = express()
var version = process.env.npm_package_version
var pjson = require('./package.json');
console.log(pjson.version);

//Define request response in root URL (/)
app.get('/', function (req, res) {
  res.send("Application version  - " + pjson.version)
})

//Launch listening server on port 9001
app.listen(9001, function () {
  console.log('App listening on port 9001')
})

