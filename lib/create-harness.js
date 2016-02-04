'use strict';

var FnObj = require('./fn-obj');
var executeGroups = require('./execute-groups');

function createHarness() {
  var groups = [];

  function createTest() {
    var tests = [];
    var beforeEachFns = [];
    var afterEachFns = [];

    function test(/* name_, _opts, _cb */) {
      var t = FnObj.apply(null, arguments);
      tests.push(t);
    }

    test.beforeEach = function beforeEach(/* name_, _opts, _cb */) {
      var t = FnObj.apply(null, arguments);
      beforeEachFns.push(t);
    };

    test.afterEach = function afterEach(/* name_, _opts, _cb */) {
      var t = FnObj.apply(null, arguments);
      afterEachFns.push(t);
    };

    groups.push({
      beforeEach: beforeEachFns,
      afterEach: afterEachFns,
      tests: tests
    });

    return test;
  }

  function run() {
    return executeGroups(groups);
  }

  return {
    createTest,
    run
  };
}


module.exports = createHarness;
