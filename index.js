//Load express module with `require` directive
var express = require('express')
var app = express()

//Define request response in root URL (/)
app.get('/', function (req, res) {
  res.send('Hello World')
})

//Launch listening server on port 9001
app.listen(9001, function () {
  console.log('App listening on port 9001!')
})

