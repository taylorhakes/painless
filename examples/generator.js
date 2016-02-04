/*
 Run by:
 babel-node --presets es2015 examples/generator.js

*/

import { test, assert } from '..';

function wait(time) {
  return new Promise(function prom(resolve) {
    setTimeout(resolve, time);
  });
}

test('simple generator 1', function* gen1() {
  assert.equal(1 + 2, 3);
  yield wait(100);
  assert.equal(5 + 6, 11);
});
test('simple generator 2', function* gen2() {
  assert.equal(1 + 5, 6);
  yield wait(100);
  assert.equal(5 + 9, 14);
});
