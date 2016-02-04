'use strict';

var runFn = require('./run-fn');

module.exports = function sequentialTests(tests, index, response) {
  index = index || 0;
  var test = tests[index];
  var prom = runFn(tests[index]);

  return prom.then(function onThen(result) {
    if (test.isTest) {
      response = result;
    }
    if (index < tests.length - 1) {
      return sequentialTests(tests, index + 1, response);
    }

    return response;
  });
};
