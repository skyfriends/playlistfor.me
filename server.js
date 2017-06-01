'use strict';
const express = require('express');

const app = express();
const bodyParser = require('body-parser').urlencoded({extended: true});

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));

app.get('/', function(req, res) {
  res.sendFile('public/index.html', {root: '.'});
});

app.use(function(req, res) {
  res.status(404).send('File Not Found! Try Again.');
});

app.listen(PORT, function() {
 console.log('We are serving this app on localhost:' + PORT);
});
