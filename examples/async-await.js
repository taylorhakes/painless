/*
 Run by:
 babel-node --presets es2015 examples/async-await.js

 */

import { createGroup, assert } from '..';

const test = createGroup();

function wait(time) {
  return new Promise(function prom(resolve) {
    setTimeout(resolve, time);
  });
}

test('async/await 1', async function gen() {
  assert.equal(1 + 2, 3);
  await wait(100);
  assert.equal(5 + 6, 11);
});
test('async/await 2', async function gen2() {
  assert.equal(1 + 5, 6);
  await wait(100);
  assert.equal(5 + 9, 14);
});
