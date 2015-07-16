'use strict';

// NPM
var fs = require('fs');

// Lib
var converter = require('./lib/converter');

// Express
var express = require('express');
var router = express.Router();

/**
 * Config
 */
var supportedFormats = ['json', 'php', 'python', 'ruby', 'csharp'];
var datasets = {
  'states': 'U.S. States',
  'canadian-provinces': 'Canadian Provinces',
  'countries': 'World Countries',
  'currencies': 'World Currencies',
  'timezones': 'World Time Zones',
  'airport-codes': 'International Airport Codes'
};

/**
 * Express
 */
var app = express();
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', { languages: supportedFormats, datasets: datasets });
});


// Datasets
app.get('/datasets/:dataset', function(req, res) {
  var errMsg;
  var dataset = req.params.dataset;

  // Ensure we have a valid dataset
  if (datasets[dataset] == "undefined") {
    errMsg = "Invalid dataset";
  }

  // Ensure we have a format
  if (!req.query.lang) {
    errMsg = "Code language not specified. Please choose a code language with the 'lang' parameter.";

  // Ensure format is one we support
  } else if (supportedFormats.indexOf(req.query.lang) === -1) {
    errMsg = "Code language '" + req.query.lang + "' not supported. Supported languages are: ['" + supportedFormats.join("', '") + "'].";
  }

  // Show error if set and break
  if (errMsg) {
    return res.status(400).json({ status: 'error', message: errMsg });
  }

  // Read data from JSON file
  fs.readFile(__dirname + '/datasets/' + dataset + '.json', function readFileDataClosure (err, data) {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Server error: Unable to read source data file' });
    }

    // Format data for specified programming language
    // ... ?
    var dataLang;
    var jsonData = JSON.parse(data);

    dataLang = converter.jsonToLang(jsonData, req.query.lang);
    if (!dataLang) {
      return res.status(400).json({ status: 'error', message: 'Unsupported lang' });
    }

    res.json({
      status: 'ok',
      data: dataLang
    });
  })
});


/**
 * Start Server
 */
var port = process.env.PORT || 1338;
var server = app.listen(port, function() {
  console.log('Express server started at http://localhost:%d', server.address().port);
});
