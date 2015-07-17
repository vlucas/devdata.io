var sprintf = require("sprintf-js").sprintf;

/**
 * Perform JSON conversion to target language
 */
function jsonToLang(json, lang, level) {
  var indentationLevel = level || 0;
  var dataFormatted = '';
  var formatMap = {
    csharp: {
      fileStart: "",
      variable: "var data = ",
      hashStart: "new Hashtable {",
      hashEnd: "}",
      hashRow: "{ \"%s\", %s }",
      hashRowEnd: ",\n",
      indent: "    ",
      lineEnd: ";"
    },
    php: {
      fileStart: "<?php\n",
      variable: "$data = ",
      hashStart: "[",
      hashEnd: "]",
      hashRow: "\"%s\" => %s",
      hashRowEnd: ",\n",
      indent: "    ",
      lineEnd: ";"
    },
    python: {
      fileStart: "",
      variable: "data = ",
      hashStart: "{",
      hashEnd: "}",
      hashRow: "\"%s\": %s",
      hashRowEnd: ",\n",
      indent: "    ",
      lineEnd: ""
    },
    ruby: {
      fileStart: "",
      variable: "data = ",
      hashStart: "{",
      hashEnd: "}",
      hashRow: ":%s => %s",
      hashRowEnd: ",\n",
      indent: "  ",
      lineEnd: ""
    },
    lua: {
      fileStart: "",
      variable: "data = ",
      hashStart: "{",
      hashEnd: "}",
      hashRow: "[\"%s\"] = %s",
      hashRowEnd: ",\n",
      indent: "    ",
      lineEnd: ""
    }
  };

  // Format JSON data according to how it looks
  // Calls jsonToLang recursively to format arrays and objects
  var jsonValueFormat = function(value, lang) {
    var indent = "\t".repeat(indentationLevel)
    var valueType = typeof value;

    // Recursive
    if (valueType == "array" || valueType == "object") {
      value = jsonToLang(value, lang, indentationLevel+1);
    } else if (valueType == "string") {
      value = "\"" + value.replace('"', '\"') + "\"";
    }

    return value;
  };

  // What kind of language is it?
  switch(lang) {
    case 'json':
      dataFormatted = json;
      break;

    case 'javascript':
      dataFormatted = 'var data = ' + JSON.stringify(json, null, 4) + ";";
      break;

    default:
      var format = formatMap[lang];
      if (!format) {
        return false;
      }

      // Level indentation
      if (indentationLevel === 0) {
        dataFormatted += format.fileStart.replace('<', '&lt;').replace('>', '&gt;');
        dataFormatted += format.variable;
      }
      dataFormatted += format.hashStart + "\n";
      var indent = format.indent.repeat(indentationLevel + 1);

      if (typeof json == "array") {
        var jsonLen = json.length;
        for(var key = 0; key < jsonLen; key++) {
          var value = jsonValueFormat(json[key], lang);

          dataFormatted += indent + sprintf(format.hashRow, key, value);
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

          dataFormatted += indent + sprintf(format.hashRow, key, value);
          if (jsonLen != i) {
            dataFormatted += format.hashRowEnd;
          }
        };
      }

      indent = format.indent.repeat(indentationLevel);
      dataFormatted += "\n" + indent + format.hashEnd;

      if (indentationLevel === 0) {
        dataFormatted += format.lineEnd;
      }
  }

  return dataFormatted;
}

/**
 * String repeat polyfill
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
 */
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  }
}


/**
 * Exports
 */
module.exports.jsonToLang = jsonToLang;
