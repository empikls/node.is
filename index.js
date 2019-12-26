const express = require('express')
const app = express()

app.get('/', (req, res) => res.send(' Proverka v1.4'))

var server = app.listen(9001, () => {
    console.log("Listening on port " + server.address().port + "...");
});
