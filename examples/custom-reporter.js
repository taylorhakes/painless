var helper = require('painless-reporter-helper');

module.exports = helper({
  'test.end': function(test) {
    if (test.success) {
      return test.name + ' success!\n';
    }

    return test.name + ' failed!\n';
  }
});
