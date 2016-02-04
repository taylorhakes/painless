'use strict';

var through = require('through');
var sequentialTests = require('./sequential-tests');
var setAsap = require('setasap');

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

function executeGroup(group) {
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
    }
  }

  function executeNext() {
    if (!len) {
      setAsap(function next() {
        output.queue(null);
      });
      return;
    }

    var allTests = [].concat(group.beforeEach, [group.tests[testIndex]], group.afterEach);
    sequentialTests(allTests)
      .then(createOnSuccess(testIndex))
      .catch(createOnError(testIndex))
      .then(outputResults)
      .then(function onNext() {
        if (testIndex < len) {
          executeNext();
        }
      });
  }

  executeNext();

  return output;
}

module.exports = executeGroups;
