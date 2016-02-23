'use strict';

var runFn = require('./run-fn');

function sequentialTests(beforeTestFns, test, afterTestFns) {
  var testResult, proms = [];
  var index = 0;
  function nextProm(result) {
    if (result.success) {
      if (index < proms.length - 1) {
        index++;
        return proms[index].then(nextProm);
      }

      return testResult;
    }

    return result;
  }

  if (beforeTestFns.length) {
    proms.push(
      runSequentialTests(beforeTestFns)
        .then(function onBefore(info) {
          if (!info.success) {
            info.name = 'beforeEach: ' + test.name;
            info.beforeTest = true;
          }
          return info;
        })
    );
  }

  proms.push(runFn(test).then(function onEnd(result) {
    testResult = result;
    return result;
  }));

  if (afterTestFns.length) {
    proms.push(runSequentialTests(afterTestFns)
        .then(function onAfter(info) {
          if (!info.success) {
            info.name = 'afterEach: ' + test.name;
            info.afterTest = true;
          }

          return info;
        })
    );
  }


  return proms[0].then(nextProm);
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
