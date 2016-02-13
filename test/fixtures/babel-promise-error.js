import { createGroup, assert } from '../..';
import Promise from 'promise-polyfill';

const test = createGroup();

test('promise', () => {
  return new Promise(function(resolve) {
    setTimeout(() => {
      assert.equal(1 + 4, 3);
      resolve();
    }, 5);
  });
});