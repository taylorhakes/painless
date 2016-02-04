/*
 Run by:
 node examples/promise.js
 */

var painless = require('..');
var test = painless.createTest();
var assert = painless.assert;

test('simple Promise 1', function() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      assert.deepEqual({ red: 'blue' }, { red: 'blue' });
      resolve();
    }, 100);
  });
});
