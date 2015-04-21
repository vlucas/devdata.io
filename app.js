'use strict';

// NPM
var fs = require('fs');

// Express
var express = require('express');
var router = express.Router();

/**
 * Config
 */
var supportedFormats = ['json', 'php'];
var datasets = ['states', 'countries', 'currencies'];

/**
 * Express
 */
var app = express();
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});


// Datasets
datasets.forEach(function(dataset) {
  app.get('/datasets/' + dataset, function(req, res) {
    var errMsg;

    // Ensure we have a format
    if (!req.query.lang) {
      errMsg = "Code language not specified. Please choose a code language with the 'lang' parameter.";

    // Ensure format is one we support
    } else if (supportedFormats.indexOf(req.query.lang) === -1) {
      errMsg = "Code language '" + req.query.lang + "' not supported. Supported languages are: ['" + supportedFormats.join("', '") + "'].";
    }

    // Show error if set and break
    if (errMsg) {
      return res.json({ status: 'error', message: errMsg }, 400);
    }

    // Read data from JSON file
    fs.readFile(__dirname + '/datasets/' + dataset + '.json', function readFileDataClosure (err, data) {
      if (err) {
        return res.json({ status: 'error', message: 'Server error: Unable to read source data file' }, 500);
      }

      // Format data for specified programming language
      // ... ?
      var dataLang;
      var jsonData = JSON.parse(data);

      dataLang = convertJSONToLang(req.query.lang, jsonData);
      if (!dataLang) {
        return res.json({ status: 'error', message: 'Unsupported lang' }, 400);
      }

      res.json({
        status: 'ok',
        data: dataLang
      });
    })
  });
});


/**
 * Perform JSON conversion to target language
 */
function convertJSONToLang(lang, json) {
  var dataFormatted = '';
  var formatMap = {
    php: {
      hashStart: '[',
      hashEnd: ']',
      hashRow: "'%s' => '%s'",
      hashRowEnd: ",\n"
    }
  };

  switch(lang) {
    case 'json':
      dataFormatted = JSON.stringify(json);
      break;

    default:
      var format = formatMap[lang];
      if (!format) {
        return false;
      }

      dataFormatted += format.hashStart;

      if (typeof json == "array") {
        var jsonLen = json.length;
        for(var key = 0; key < jsonLen; key++) {
          var value = json[key];
          var valueType = typeof value;

          // Recursive
          if (valueType == "array" || valueType == "object") {
            value = convertJSONToLang(lang, value);
          } else if (valueType == "string") {
            value = "'" + value + "'";
          }

          dataFormatted += "'" + key + "' => " + value;
          if (jsonLen != key) {
            dataFormatted += format.hashRowEnd;
          }
        };
      }
      else if (typeof json == "object") {
        var jsonLen = Object.keys(json).length;
        var i = 0;
        for(var key in json) {
          i++;
          var value = json[key];
          var valueType = typeof value;

          // Recursive
          if (valueType == "array" || valueType == "object") {
            value = convertJSONToLang(lang, value);
          } else if (valueType == "string") {
            value = "'" + value + "'";
          }

          dataFormatted += "'" + key + "' => " + value;
          if (jsonLen != i) {
            dataFormatted += format.hashRowEnd;
          }
        };
      }

      dataFormatted += format.hashEnd;
  }

  return dataFormatted;
}

/**
 * Start Server
 */
var port = process.env.PORT || 1337;
var server = app.listen(port, function() {
  console.log('Express server started at http://localhost:%d', server.address().port);
});
