/*
 Run by:
 node examples/promise.js
 */

var painless = require('..');
var test = painless.test;
var assert = painless.assert;

test('simple Promise 1', function() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      assert.deepEqual({ red: 'blue' }, { red: 'blue' });
      resolve();
    }, 100);
  });
});
test('simple Promise 2', function() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      assert.equal(1 + 6, 7);
      resolve();
    }, 100);
  });
});
