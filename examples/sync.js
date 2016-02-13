/*
Run by:
node examples/sync.js
 */

var painless = require('..');
var test = painless.createGroup('Sync examples');
var assert = painless.assert;

test('simple sync pass', function sync1() {
  assert.deepEqual([1,2,3], [1,2,3]);
});

test('simple sync pass 2', function sync2() {
  assert.equal(5, 5);
});
