var api = require('./api');

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
//require('dotenv').config();

var app = express();

var port = process.env.PORT || 5000;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Landing page route
app.get('/', (req, res) => {
  // Render your landing page template or send a simple response
  res.json({ message: "http://sheet2api.vercel.app/api?id=SPREADSHEET_ID&sheet=SHEET_NAME" });
});

// get api
app.get('/api', api);

// error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function() {
  console.log('API link is listening on port ' + port);
});

// Tutorial and credit: https://gsx2json.com/