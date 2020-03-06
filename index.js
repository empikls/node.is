//Load express module with `require` directive
var express = require('express')
var app = express()
var version = process.env.npm_package_version
var appVersion = process.env.INPUT_VERSION

//Define request response in root URL (/)
app.get('/', function (req, res) {
  res.send("New application version is  - " + appVersion)
})

//Launch listening server on port 9001
app.listen(9001, function () {
  console.log('App listening on port 9001')
})

