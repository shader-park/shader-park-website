'use strict';

const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
});

app.get('/*', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
})

http.listen(port, () => console.log('listening on port ' + port));