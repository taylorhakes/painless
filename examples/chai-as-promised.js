/*
 Run by:
 node examples/chai-as-promised.js
 */

var painless = require('..');
var test = painless.createGroup();
var assert = painless.assert;

function delayedPromise(val) {
  return new Promise(function prom(resolve) {
    setTimeout(function timeout() {
      resolve(val);
    }, 20);
  });
}

test('simple Promise 1', function testFn() {
  var prom = delayedPromise(10);

  // Must return the assert or it will not wait
  return assert.eventually.equal(prom, 10);
});
