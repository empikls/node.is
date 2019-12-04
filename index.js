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
