'use strict';

var through = require('through');
var sequentialTests = require('./sequential-tests');
var setAsap = require('setasap');

function executeGroups(groups, options) {
  var output = through();

  function endStream() {
    output.queue(null);
  }

  function createStream(index) {
    var stream = executeGroup(groups[index], options);
    stream.on('data', output.queue);
    stream.on('end', index < groups.length - 1 ? createStream.bind(null, index + 1) : endStream);
  }

  createStream(0);
  return output;
}

function executeGroup(group, options) {
  var testIndex = 0;
  var resultIndex = 0;
  var len = group.tests.length;
  var responses = Array(len);
  var output = through();

  var changedOptions = options || {};
  var async = changedOptions.async || false;
  var bunchSize = changedOptions.bunch || 10;

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
    while (responses[resultIndex]) {
      output.queue(responses[resultIndex]);
      delete responses[resultIndex];
      resultIndex++;
    }
    if (resultIndex === len) {
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
        testIndex++;
        if (testIndex < len) {
          executeNext();
        }
      });
  }

  function executeBunch(size) {
    var promArr = [];
    var prom;
    for (var i = 0; i < size && testIndex < len; i++, testIndex++) {
      var allTests = [].concat(group.beforeEach, [group.tests[testIndex]], group.afterEach);
      prom = sequentialTests(allTests)
        .then(createOnSuccess(testIndex))
        .catch(createOnError(testIndex))
        .then(outputResults);

      promArr.push(prom);
    }

    Promise.all(promArr)
      .then(function onDone() {
        if (testIndex < len) {
          executeBunch(size);
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
