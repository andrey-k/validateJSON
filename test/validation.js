var should = require('should'),
    request = require('supertest');

describe('JSON validation', function() {
  var url = 'http://localhost:8020';
  describe('json-schema', function() {
    it('should return error trying to test empty body', function(done) {
      var container = {};
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(400);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/validationError.json');
          res.body.should.have.property('error', 'Empty request body.');
          done();
        });
    });
    it('should return error trying to test data without schema field', function(done) {
      var container = {
        'href': 'http://localhost:8020/container/2250'
      };
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(400);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/validationError.json');
          res.body.should.have.property('error', 'Input document does not specify a schema.');
          done();
        });
    });
    it('should return error trying to test data with incorrect url in schema field', function(done) {
      var container = {
        'schema': 'schema'
      };
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(400);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/validationError.json');
          res.body.should.have.property('error', 'URL of specified schema is not well-formed.');
          done();
        });
    });
    it('should return error trying to get schema from url in schema field', function(done) {
      var container = {
        'schema': 'http://localhost:8020/schemas/container-wrong.json'
      };
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(400);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/validationError.json');
          res.body.should.have.property('error', 'Specified schema could not be retrieved.');
          done();
        });
    });
    it('should return error trying to validate json according to json-schema with missing href field', function(done) {
      var container = {
        'schema': 'http://localhost:8020/schemas/container.json'
      };
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(400);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/validationError.json');
          res.body.should.have.property('error', 'Input document is not valid according to the specified schema.');
          res.body.should.have.property('details', 'Missing required property: href');
          done();
        });
    });
    it('should return error trying to validate json according to json-schema with wrong customer field', function(done) {
      var container = {
        'href': 'http://localhost:8020/container/2250',
        'schema': 'http://localhost:8020/schemas/container.json',
        'customer': 10,
        'container': {
            'id': 2250,
            'serial': 13298492250,
            'type': 1,
            'customer': '13',
            'site': 214,
            'siteContainer': 2250,
            'fillLevel': 39,
            'dateWhenFull': '2014-05-16',
            'devices': [2250]
        },
        'time': '2014-05-14T12:51:57Z'
      };
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(400);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/validationError.json');
          res.body.should.have.property('error', 'Input document is not valid according to the specified schema.');
          res.body.should.have.property('details', 'invalid type: string (expected integer)');
          done();
        });
    });
it('should pass validation according to json-schema', function(done) {
      var container = {
        'href': 'http://localhost:8020/container/2250',
        'schema': 'http://localhost:8020/schemas/container.json',
        'customer': 10,
        'container': {
            'id': 2250,
            'serial': 13298492250,
            'type': 1,
            'customer': 13,
            'site': 214,
            'siteContainer': 2250,
            'fillLevel': 39,
            'dateWhenFull': '2014-05-16',
            'devices': [2250]
        },
        'time': '2014-05-14T12:51:57Z'
      };
      request(url)
      .post('/validatejson')
      .send(container)
      .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.status(200);
          res.body.should.have.property('schema', 'http://localhost:8020/schemas/container.json');
          res.body.should.have.property('href', 'http://localhost:8020/container/2250');
          res.body.should.have.property('customer', 10);
          done();
        });
    });
  });
});