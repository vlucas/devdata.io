var sprintf = require("sprintf-js").sprintf;

/**
 * Perform JSON conversion to target language
 */
function jsonToLang(json, lang) {
  var dataFormatted = '';
  var formatMap = {
    php: {
      hashStart: '[',
      hashEnd: ']',
      hashRow: "'%s' => %s",
      hashRowEnd: ",\n"
    },
    ruby: {
      hashStart: '{',
      hashEnd: '{',
      hashRow: ":%s => %s",
      hashRowEnd: ",\n"
    }
  };

  // Format JSON data according to how it looks
  // Calls jsonToLang recursively to format arrays and objects
  var jsonValueFormat = function(value, lang) {
    var valueType = typeof value;

    // Recursive
    if (valueType == "array" || valueType == "object") {
      value = jsonToLang(value, lang);
    } else if (valueType == "string") {
      value = "'" + value + "'";
    }

    return value;
  };

  // What kind of language is it?
  switch(lang) {
    case 'json':
      dataFormatted = JSON.stringify(json, null, 4);
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
          var value = jsonValueFormat(json[key], lang);

          dataFormatted += sprintf(format.hashRow, key, value);
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
          var value = jsonValueFormat(json[key], lang);

          dataFormatted += sprintf(format.hashRow, key, value);
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
 * Exports
 */
module.exports.jsonToLang = jsonToLang;
