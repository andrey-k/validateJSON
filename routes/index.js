var express = require('express'),
    router = express.Router(),
    validator = require('validator'),
    tv4 = require('tv4'),
    request = require('request');

/**
* isEmpty() evaluate objects to its emptiness
* @param <Object> obj
* 
* @return <Bool> bool
*
*/
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

router.post('/validatejson', function(req, res) {
  var notValid = false,
      serverResponse = {
      'href': 'http://localhost:8020/validateJSON',
      'schema': 'http://localhost:8020/schemas/validationError.json',
      'time': new Date().toISOString().replace(/\..+/, 'Z'),
      'input': JSON.stringify(req.body)
  },
      errorSchema = {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "required": ["href", "schema", "error", "time"],
      "properties": {
        "href": {
          "type": "string",
          "format": "uri"
        },
        "schema": {
          "type": "string",
          "format": "uri"
        },
        "error": {
          "type": "string",
          "enum": [
            "Empty request body.",
            "Input document is not well-formed.",
            "Input document does not specify a schema.",
            "URL of specified schema is not well-formed.",
            "Specified schema could not be retrieved.",
            "Input document is not valid according to the specified schema."
          ]
        },
        "details": {
          "type": "string"
        },
        "time": {
          "type": "string",
          "pattern": "^[12][0-9][0-9][0-9]-[01][0-9]-[0123][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$"
        },
        "input": {
          "type": "string"
        }
      }
  },
      schema,
      instance,
      status;

  // first initial checks
  if (isEmpty(req.body)) {
    serverResponse.error = 'Empty request body.';
    serverResponse.input = '';
    notValid = true;
  } else if (!req.body.hasOwnProperty('schema')) {
    serverResponse.error = 'Input document does not specify a schema.';
    notValid = true;
  } else if (!validator.isURL(req.body.schema)) {
    serverResponse.error = 'URL of specified schema is not well-formed.';
    notValid = true;
  }
  // if first tests fails then validate error response with the error schema
  // else retrieve json-schema from the given link
  if (notValid) {
    schema = errorSchema;
    instance = serverResponse;
    status = 400;

    if (tv4.validate(instance, schema)) {
      res.send(status, serverResponse);
    } else {
      res.send(500);
    }
  } else {
    request({
      url: req.body.schema,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        schema = body;
        instance = req.body;
        status = 200;
        if (tv4.validate(instance, schema)) {
          res.send(status, instance);
        } else {
          schema = errorSchema;
          serverResponse.error = 'Input document is not valid according to the specified schema.';
          serverResponse.details = tv4.error.message;
          instance = serverResponse;
          status = 400;
        }
      } else {
        schema = errorSchema;
        serverResponse.error = 'Specified schema could not be retrieved.';
        instance = serverResponse;
        status = 400;
      }

      // if body validation fails validate error response
      if (status === 400) {
        if (tv4.validate(instance, schema)) {
          res.send(status, instance);
        } else {
          res.send(500);
        }
      }
    });
  }
});

module.exports = router;
