var FnObj = require('./fn-obj');
var executeGroups = require('./execute-groups');

function createHarness() {
  var groups = [];

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

  function run() {
    return executeGroups(groups);
  }

  return {
    createTest,
    run
  };
}


module.exports = createHarness;