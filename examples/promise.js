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
      assert.equal(1 + 4, 5);
      resolve();
    });
  });
});
test('simple Promise 2', function() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      assert.equal(1 + 6, 7);
      resolve();
    });
  });
});
