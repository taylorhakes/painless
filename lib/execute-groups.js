'use strict';

var through = require('through');
var sequentialTests = require('./sequential-tests');
var setAsap = require('setasap');
var GROUP_START = 'group.start';
var GROUP_END = 'group.end';
var TEST_END = 'test.end';


function executeGroups(groups, options) {
  var output = through();
  var testCount = 0;
  var allErrors = [];
  var time = 0;

  function endStream() {
    output.queue({
      type: 'end',
      data: {
        time: time,
        testCount: testCount,
        errors: allErrors,
        success: allErrors.length === 0
      }
    });
    output.queue(null);
  }

  function createStream(index) {
    var stream;
    stream = executeGroup(groups[index], options);

    function onGroupEnd() {
      createStream(index + 1);
    }

    stream.on('data', function onData(info) {
      if (info.type === GROUP_END) {
        testCount += info.data.testCount;
        if (info.data.errors.length) {
          allErrors = allErrors.concat(info.data.errors);
        }
        time += info.data.time;
      }
      output.queue(info);
    });
    stream.on('end', index < groups.length - 1 ? onGroupEnd : endStream);
  }
  createStream(0);
  return output;
}

function executeGroup(group, options) {
  var testIndex = 0;
  var resultIndex = 0;
  var len = group.tests.length;
  var responses = {};
  var errors = [];
  var output = through();
  var changedOptions = options || {};
  var async = changedOptions.async || false;
  var bunchSize = changedOptions.bunch || 10;
  var time = 0;

  setAsap(function onNextTick() {
    output.queue({ type: GROUP_START, data: { name: group.name } });
  });

  function createOnResult(index) {
    return function onResult(info) {
      var i, lines, newLines;

      info.success = !info.error;

      if (!info.success) {
        newLines = [];
        lines = String(info.error.stack).split('\n');
        for (i = 1; i < lines.length; i++) {
          if (lines[i].indexOf('(domain.js') > -1) {
            break;
          }
          newLines.push(lines[i].trim());
        }
        info.error.stack = newLines.join('\n');
      }
      responses[index] = info;

      while (responses[resultIndex]) {
        if (responses[resultIndex].success === false) {
          errors.push(responses[resultIndex]);
        }
        time += responses[resultIndex].time;
        output.queue({ type: TEST_END, data: responses[resultIndex] });
        delete responses[resultIndex];
        resultIndex++;
      }

      if (resultIndex === len) {
        output.queue({
          type: GROUP_END,
          data: {
            name: group.name,
            success: errors.length === 0,
            testCount: len,
            errors: errors,
            time: time
          }
        });
        output.queue(null);
      }

      if (testIndex < len) {
        executeNext();
      }
    };
  }

  function executeNext() {
    if (!len) {
      setAsap(function next() {
        output.queue(null);
      });
      return;
    }

    var allTests = [].concat(group.beforeEach, [group.tests[testIndex]], group.afterEach);
    var resultFn = createOnResult(testIndex);
    sequentialTests(allTests)
      .then(resultFn)
      .catch(resultFn);

    testIndex++;
  }

  function executeBunch(size) {
    for (var i = 0; i < size && testIndex < len; i++) {
      executeNext();
    }
  }

  if (async) {
    executeBunch(bunchSize);
  } else {
    executeNext();
  }

  return output;
}

module.exports = executeGroups;
