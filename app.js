var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    tv4 = require('tv4'),
    routes = require('./routes/index'),
    app = express();

app.use(bodyParser.json());
// not well formed json
app.use(function (error, req, res, next){
  var serverResponse = {
      'href': 'http://localhost:8020/validateJSON',
      'schema': 'http://localhost:8020/schemas/validationError.json',
      'error':'Input document is not well-formed.',
      'time': new Date().toISOString().replace(/\..+/, 'Z'),
      'input': error.body || ''
  },
      errorSchema = {
      '$schema': 'http://json-schema.org/draft-04/schema#',
      'type': 'object',
      'required': ['href', 'schema', 'error', 'time'],
      'properties': {
        'href': {
          'type': 'string',
          'format': 'uri'
        },
        'schema': {
          'type': 'string',
          'format': 'uri'
        },
        'error': {
          'type': 'string',
          'enum': [
            'Empty request body.',
            'Input document is not well-formed.',
            'Input document does not specify a schema.',
            'URL of specified schema is not well-formed.',
            'Specified schema could not be retrieved.',
            'Input document is not valid according to the specified schema.'
          ]
        },
        'details': {
          'type': 'string'
        },
        'time': {
          'type': 'string',
          'pattern': '^[12][0-9][0-9][0-9]-[01][0-9]-[0123][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z$'
        },
        'input': {
          'type': 'string'
        }
      }
  };

  if (tv4.validate(serverResponse, errorSchema)) {
    res.send(400, serverResponse);
  } else {
    res.send(500);
  }
});

app.use(bodyParser.urlencoded());
app.use('/schemas', express.static(path.join(__dirname, 'schemas')));
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(res.body + ' - ' + err.message);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(8020);

module.exports = app;
