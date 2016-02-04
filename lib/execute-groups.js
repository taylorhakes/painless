'use strict';

var through = require('through');
var runFn = require('./run-fn');
var sequentialTests = require('./sequential-tests');
var bunchSize = 10;

function executeGroups(groups) {
  var output = through();

  function endStream() {
    output.queue(null);
  }

  function createStream(index) {
    var stream = executeGroup(groups[index]);
    stream.on('data', output.queue);
    stream.on('end', index < groups.length - 1 ? createStream.bind(null, index + 1) : endStream);
  }

  createStream(0);
  return output;
}

function executeGroup(group, async) {
  var responses = {};
  var testIndex = 0;
  var len = group.tests.length;
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
    sequentialTests([].concat(group.beforeEach, [group.tests[testIndex]], group.afterEach))
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
    for (var i = 0; i < size && testIndex < len; i++, testIndex++) {
      prom = runFn(group[i])
        .then(createOnSuccess(i))
        .catch(createOnError(i))
        .then(outputResults);

      promArr.push(prom);
    }

    return Promise.all(promArr)
      .then(function onDone() {
        if ( testIndex < len) {
          return executeBunch(size);
        }
      });
  }

  if (async) {
    executeBunch(bunchSize);
  } else {
    executeNext();
  }

  return output;
}

module.exports = executeGroups;
