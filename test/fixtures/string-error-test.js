/*
 Run by:
 node examples/sync-error.js
 */

var painless = require('../..');
var test = painless.createGroup();

test('string assertion', function sync1() {
  throw 'hello';
});
