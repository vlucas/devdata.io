'use strict';

// Express
var express = require('express');
var router = express.Router();

/**
 * Configure Express
 */
var app = express();
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Start Server
 */
var port = process.env.PORT || 1337;
var server = app.listen(port, function() {
  console.log('Express server started at http://localhost:%d', server.address().port);
});
