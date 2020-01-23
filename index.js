//Load express module with `require` directive
var express = require('express')
var app = express()


//Define request response in root URL (/)
app.get('/', function (req, res) {
  var appVersion = process.env.npm_package_version
  res.send("Application version - " + appVersion)
})

//Launch listening server on port 9001
app.listen(9001, function () {
  console.log('App listening on port 9001')
})

