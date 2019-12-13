<<<<<<< HEAD
const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

var server = app.listen(9001, () => {
    console.log("Listening on port " + server.address().port + "...");
});
=======
'use strict';

const express = require('express');

// Constants
const PORT = 9000;
const HOST = '127.0.0.1';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello devops53 group');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
>>>>>>> dev
