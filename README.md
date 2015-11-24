# Painless Test Runner
> Super simple test runner

Simple test structure that just works. All tests are really fast because of the lightweight syntax.
  The code base is really small < 500 lines.

## Why use painless?
- Really fast
- Easy to learn
- Works with Babel, Promises, Observables, Streams, Generators, Callbacks out of the box
- No Globals
- Easy to debug (Tests are just basic node processes. No subprocesses)
- Coverage support with Istanbul

## Install
```
npm install painless --save-dev
```
Execute a single test
```
node test/test.js
```
Or run multiple tests
```
./node_modules/.bin/painless test/**/*.js
```
Add tests to package.json
```
{
 "scripts": {
    "test": "painless test/**/*.js"
  }
}
```
## Example Test
```js
var painless = require('painless');
var test = painless();
var assert = painless.assert;

// Sync test
test('sync test', function() {
    assert.deepEqual({ a: '1' }, { a: '1'});
});

// Promise test
test('promise test', function() {
    return new Promise(function(resolve) {
        setTimeout(function() {
            assert.deepEqual({ a: '1' }, { a: '1'});
            resolve();
        }, 10);
    });
});

// Callback test
test('callback test', function(done) {
    setTimeout(function() {
        assert.deepEqual({ a: '1' }, { a: '1'});
        done();
    }, 10);
});
```

### Use any assertion library
Painless comes bundled with chai assertion library, but will work with any assertion library that throws an `AssertionError`
