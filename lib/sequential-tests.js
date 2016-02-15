'use strict';

var runFn = require('./run-fn');

function sequentialTests(beforeTestFns, test, afterTestFns) {
  var testResult;
  var prom = Promise.resolve();
  if (beforeTestFns.length) {
    prom = prom.then(function onBefore() {
      return runSequentialTests(beforeTestFns)
        .catch(function onBeforeErr(error) {
          error.name = 'beforeEach: ' + test.name;
          error.beforeTest = true;
          return Promise.reject(error);
        });
    });
  }

  prom = prom.then(function onProm() {
    return runFn(test);
  }).then(function onTestDone(result) {
    testResult = result;
  });

  if (afterTestFns.length) {
    prom = prom.then(function onAfter() {
      return runSequentialTests(afterTestFns)
        .catch(function onBeforeErr(error) {
          error.name = 'afterEach: ' + test.name;
          error.afterTest = true;
          return Promise.reject(error);
        });
    });
  }


  return prom.then(function onTest() {
    return testResult;
  });
}

function runSequentialTests(tests, index) {
  index = index || 0;
  var prom = runFn(tests[index]);
  return prom.then(function onThen(result) {
    if (index < tests.length - 1) {
      return runSequentialTests(tests, index + 1);
    }
    return result;
  });
}

module.exports = sequentialTests;
