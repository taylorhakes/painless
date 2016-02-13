import { createGroup, assert } from '../..';
import Promise from 'promise-polyfill';

const test = createGroup();

test('sync', () => {
  assert(1 + 4, 5);
});


