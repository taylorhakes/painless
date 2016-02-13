import { createGroup, assert } from '../..';
import Promise from 'promise-polyfill';

const test = createGroup();
const asyncFn = function() {
  return new Promise(function(resolve, reject) {
    setTimeout(() => {
      reject(new Error('This is an error'));
    }, 5);
  });
};

test('promise', function* () {
  yield asyncFn();
});