/*
 Run by:
 node examples/promise.js
 */

var painless = require('..');
var test = painless.createTest();
var assert = painless.assert;

test('simple Promise 1', function testFn() {
  return new Promise(function prom(resolve) {
    setTimeout(function timeout() {
      assert.deepEqual({ red: 'blue' }, { red: 'blue' });
      resolve();
    }, 100);
  });
});
