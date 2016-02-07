/*
 Run by:
 node examples/callback.js
 */

var painless = require('..');
var test = painless.createGroup();
var assert = painless.assert;

test('callback 1', function testFn(done) {
  setTimeout(function timeout() {
    assert(true);
    done();
  }, 20);
});
