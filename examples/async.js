/*
 Run by:
 babel-node --presets es2015 examples/async.js

 */

import { test, assert } from '..';

function wait(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

test('simple generator 1', async function gen() {
  assert.equal(1 + 2, 3);
  await wait(100);
  assert.equal(5 + 6, 11);
});
test('simple generator 2', async function gen2() {
  assert.equal(1 + 5, 6);
  await wait(100);
  assert.equal(5 + 9, 14);
});