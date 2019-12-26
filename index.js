const express = require('express')
const app = express()

app.get('/', (req, res) => res.send(' NAKONECZTO INGRESS VIPUSTILSYA!'))

var server = app.listen(9001, () => {
    console.log("Listening on port " + server.address().port + "...");
});
