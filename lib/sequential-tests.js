'use strict';

var runFn = require('./run-fn');

function sequentialTests(beforeTestFns, test, afterTestFns) {
  var testResult, fns = [];
  var index = 0;
  function nextProm(result) {
    if (result.success) {
      if (index < fns.length - 1) {
        index++;
        return fns[index]().then(nextProm);
      } else if (afterTestFns.length) {
        return runAfterFns().then(function afterFns(afterResult) {
          if (!afterResult.success) {
            return afterResult;
          }

          return testResult;
        });
      }

      return testResult;
    }

    if (afterTestFns.length) {
      return runAfterFns().then(function afterFnErrors() {
        return testResult;
      });
    }

    return result;
  }

  function runAfterFns() {
    return runSequentialTests(afterTestFns, false)
      .then(function onAfter(info) {
        if (!info.success) {
          info.name = 'afterEach: ' + test.name;
          info.afterTest = true;
        }

        return info;
      });
  }

  if (beforeTestFns.length) {
    fns.push(function beforeEachs() {
      return runSequentialTests(beforeTestFns, true)
        .then(function onBefore(info) {
          if (!info.success) {
            info.name = 'beforeEach: ' + test.name;
            info.beforeTest = true;

            testResult = info;
          }
          return info;
        });
    });
  }

  fns.push(function onTest() {
    return runFn(test).then(function onEnd(result) {
      testResult = result;
      return result;
    });
  });

  return fns[0]().then(nextProm);
}

function runSequentialTests(tests, stopOnError) {
  let firstError = null;

  function innerRunTests(index) {
    return runFn(tests[index]).then(function onThen(result) {
      if (!result.success) {
        if (stopOnError) {
          return result;
        }

        firstError = result;
      }

      if (index < tests.length - 1) {
        return innerRunTests(index + 1);
      }
      return firstError || result;
    });
  }

  return innerRunTests(0);
}

module.exports = sequentialTests;
