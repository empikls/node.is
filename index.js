const express = require('express')
const app = express()

app.get('/', (req, res) => res.send(' App version2'))

var server = app.listen(9001, () => {
    console.log("Listening on port " + server.address().port + "...");
});
