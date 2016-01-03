/*
 Run by:
 babel-node --presets es2015 examples/es6-sync.js
 */

import { test, assert } from '..';

test('Simple sync pass', () => {
  assert.equal(1 + 2, 3);
});
test('Simple sync fail', () => {
  assert.equal(1 + 4, 5);
});


