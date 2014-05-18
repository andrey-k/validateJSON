Simple REST based web service used to validate JSON documents against a specified JSON
schema.

C.f. http://json-schema.org

The service accepts POST requests with JSON as body. JSON-schema could be found in schemas/container.json. In case of fail validation service returns error with json-schema like schemas/validationError.json otherwise returns body as it is.


Install all dependencies to run the service. Install devDependencies in case of testing.

Run service by 'npm start' in project root.

Test by 'mocha' in project root. That will take test from test/validation.js