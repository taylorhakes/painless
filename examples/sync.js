/*
Run by:
node examples/sync.js
 */

var painless = require('..');
var test = painless.createTest();
var assert = painless.assert;

test('simple sync pass', function() {
  assert.equal(1 + 2, 3);
});

test('simple sync pass 2', function() {
  assert.equal(1 + 2, 3);
});
