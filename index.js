var FnObj = require('./lib/fn-obj');
var executeGroups = require('./lib/execute-groups');
var setAsap = require('setasap');
var tap = require('./lib/reporters/tap');
var chai = require('chai');
var sinon = require('sinon');
var tapSpec = require('tap-spec');

var groups = [];

/**
 * Main test function
 */
function createTest() {
  var tests = [];
  var beforeEach = [];
  var afterEach = [];

  function test(/* name_, _opts, _cb */) {
    var t = FnObj.apply(null, arguments);
    tests.push(t);
  }

  test.beforeEach = function(/* name_, _opts, _cb */) {
    var t = FnObj.apply(null, arguments);
    beforeEach.push(t);
  };

  test.afterEach = function(/* name_, _opts, _cb */) {
    var t = FnObj.apply(null, arguments);
    afterEach.push(t);
  };

  groups.push({
    beforeEach: beforeEach,
    afterEach: afterEach,
    tests: tests
  });

  return test;
}

setAsap(function() {
  var groupOutput = executeGroups(groups);
  var processOutput = tap(groupOutput).pipe(tapSpec());
  var hasError = false;
  groupOutput.on('data', function(info) {
    if (!info.success) {
      hasError = true;
    }
  });
  groupOutput.on('end', function() {
    process.exit(hasError ? 1 : 0);
  });
  processOutput.pipe(process.stdout);
  process.on('exit', function(code) {
    if (code || !hasError) {
      return;
    }

    process.exit(1);
  });
});

module.exports.createTest = createTest;
module.exports.assert = chai.assert;
module.exports.expect = chai.expect;
module.exports.spy = sinon.spy;
module.exports.stub = sinon.stub;
module.exports.mock = sinon.mock;
module.exports.sinon = sinon;

