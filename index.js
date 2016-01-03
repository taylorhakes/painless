var FnObj = require('./lib/fn-obj');
var executeGroup = require('./lib/execute-group');
var setAsap = require('setAsap');
var tap = require('./lib/reporters/tap');
var chai = require('chai');

var tests = [];
var group;

/**
 * Main test function
 */
function test(/* name_, _opts, _cb */) {
  var t = FnObj.apply(null, arguments);
  tests.push(t);
}

setAsap(function() {
  var groupOutput = executeGroup(tests);
  var processOutput = tap(groupOutput);
  var hasError = false;
  groupOutput.on('data', function(info) {
    if (!info.success) {
      hasError = true;
    }
  });
  processOutput.pipe(process.stdout);
  process.on('exit', function(code) {
    if (code || !hasError) {
      return;
    }

    process.exit(1);
  });
});

module.exports.test = test;
module.exports.assert = chai.assert;
module.exports.expect = chai.expect;

