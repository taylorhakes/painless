/*
 Run by:
 babel-node --presets es2015 examples/es6-sync.js
 */

import { createGroup, assert } from '..';

const test = createGroup();

test('ES6 sync pass 1', () => {
  assert.equal(1 + 2, 3);
});
test('ES6 sync pass 2', () => {
  assert.equal(1 + 4, 5);
});
