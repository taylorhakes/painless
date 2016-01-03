/*
Run by:
node examples/sync.js
 */

var painless = require('..');
var test = painless.test;
var assert = painless.assert;

test('Simple sync pass', function() {
  assert.equal(1 + 2, 3);
});
test('Simple sync fail', function() {
  assert.equal(1 + 4, 5);
});

