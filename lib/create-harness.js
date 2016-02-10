'use strict';

var FnObj = require('./fn-obj');
var executeGroups = require('./execute-groups');

function createHarness() {
  var groups = [];

  function createGroup(options) {
    var tests = [];
    var beforeEachFns = [];
    var afterEachFns = [];
    options = options || {};

    function test(/* name_, _opts, _cb */) {
      var t = FnObj.apply(null, arguments);
      t.isTest = true;
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
      tests: tests,
      options: options
    });

    return test;
  }

  function run(options) {
    return executeGroups(groups, options);
  }

  return {
    createGroup: createGroup,
    run: run
  };
}


module.exports = createHarness;
