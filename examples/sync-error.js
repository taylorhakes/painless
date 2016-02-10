/*
 Run by:
 node examples/sync-error.js
 */

var painless = require('..');
var test = painless.createGroup();
var assert = painless.assert;

//test('simple sync pass', function sync1() {
//  assert.deepEqual([1,2,5], [1,2,3]);
//});
//
//test('simple sync pass 2', function sync2() {
//  assert.equal(6, 5);
//});

test('hello', function() {
  assert.deepEqual([[1,2,3],[1,2,3,{a: 'b', c: 'd'}]], [1,2,5,[1,2,3]]);
});

