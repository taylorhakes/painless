var through = require('through');
var runFn = require('./run-fn');
var bunchSize = 10;

function executeGroup(tests, async) {
  var responses = {};
  var testIndex = 0;
  var len = tests.length;
  var output = through();

  function createOnSuccess(index) {
    return function onSuccess(info) {
      info.success = true;
      responses[index] = info;
    };
  }

  function createOnError(index) {
    return function onError(info) {
      info.success = false;
      responses[index] = info;
    };
  }

  function outputResults() {
    while (responses[testIndex]) {
      output.queue(responses[testIndex]);
      delete responses[testIndex];
      testIndex++;
    }
    if (testIndex === len) {
      output.queue(null);
      output.dispose();
    }
  }

  function executeNext() {
    runFn(tests[testIndex])
      .then(createOnSuccess(testIndex))
      .catch(createOnError(testIndex))
      .then(outputResults)
      .then(function onNext() {
        if (testIndex < len) {
          executeNext();
        }
      });
  }

  function executeBunch(size) {
    var promArr = [];
    var prom;
    for (var i = 0; i < size; i++) {
      prom = runFn(tests[i])
        .then(createOnSuccess(i))
        .catch(createOnError(i))
        .then(outputResults);

      promArr.push(prom);
    }

    Promise.all(promArr)
      .catch(function onError() {})
      .then(function onDone() { executeBunch(size); });
  }

  if (async) {
    executeBunch(bunchSize);
  } else {
    executeNext();
  }

  return output;
}

module.exports = executeGroup;
