/*
 Run by:
 node examples/callback.js
 */

var painless = require('..');
var test = painless.createGroup();
var assert = painless.assert;

test('simple Promise 1', function testFn(done) {
  setTimeout(function timeout() {
    assert(true);
    done();
  }, 20);
});
