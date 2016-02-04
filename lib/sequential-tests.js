'use strict';

var runFn = require('./run-fn');

module.exports = function sequentialTests(tests, index) {
  index = index || 0;
  var prom = runFn(tests[index || 0]);
  if (index < tests.length - 1) {
    prom = prom.then(sequentialTests.bind(null, tests, index + 1));
  }
  return prom;
};
