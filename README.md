# Painless Test Library
[![Build Status](https://travis-ci.org/taylorhakes/painless.svg?branch=master)](https://travis-ci.org/taylorhakes/painless)
[![Coverage Status](https://coveralls.io/repos/github/taylorhakes/painless/badge.svg?branch=master)](https://coveralls.io/github/taylorhakes/painless?branch=master)

Simple test structure that is easy to learn and use. All tests are really fast because of the lightweight syntax.
  The code base is really small. Less than 500 lines.

## Why use painless?
- Really fast
- Easy to learn
- Works with ES6/Babel, Promises, Async/Await, Generators, Callbacks, Observables, Streams,  Processes,  out of the box
- No Globals
- Easy to debug (Tests are just basic node processes. No subprocesses)
- Comes bundled with assertions and mocking (Chai and Sinon)
- 100% Test Coverage
- Coverage support with Istanbul

## Compared to other frameworks <a name="comparison"></a>
#### Mocha
Painless Advantages
- Has everything you need included (assertions, mocking, etc)
- Supports Async/Await, Promises, Generators, Observables, Streams, Processes
- Doesn't need a separate executable to run (just run `node test.js`)
- Is easier to debug (single process)
- Has no globals
- Much faster to run tests

Mocha Advantages
- Supports browser and node (Painless is only node. It will support browsers soon.)
- More widely used (more battle tested)
- Integrated coverage

#### Ava
Painless Advantages
- Easier to debug (single process)
- Has everything you need included (assertions, mocking, etc)
- Doesn't need a separate executable to run (just run `node test.js`)
- Faster for most types of tests (even IO tests with painless --async flag)
- Doesn't require babel (write your tests in ES5, typescript, coffeescript, etc)
- Built-in support for Node streams and processes

Ava Advantages
- Test groups are isolated (Less likely for tests to affect each other)

#### Jasmine
Painless Advantages
- Supports Async/Await, Promises, Generators, Observables, Streams, Processes
- Doesn't need a separate executable to run (just run `node test.js`)
- Easier to debug (single process)
- Has no globals
- Much faster

Jasmine Advantages
- Supports browser and node (Painless is only node. It will support browsers soon.)
- More widely used (more battle tested)

#### Tape
Painless Advantages
- Supports Async/Await, Promises, Generators, Observables, Streams, Processes
- Has everything you need included (assertions, mocking, etc)
- Simpler test syntax
- Better output format out of the box
- Supports test groups and `beforeEach` and `afterEach`



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
Run ES6 tests
```
babel-node --presets es2015 ./node_modules/.bin/painless test/**/*.js
```

Add tests to package.json
```js
{
 "scripts": {
    "test": "painless test/**/*.js"
  }
}
```
## Example Test
ES6
```js
import { createGroup, assert } from 'painless';

const test = createGroup();

// Sync test
test('sync test', () => {
    assert.deepEqual({ a: '1' }, { a: '1'});
});


function promiseFn() {
    return new Promise((resolve) => {
        setTimeout(function() {
            resolve({ a: '1' });
        }, 10);
    });
}

// Promise test
test('promise test', () => {
    return assert.eventually.deepEqual(promiseFn(), { a: '1'});
});

// Promise alt syntax
test('promise test', () => {
    return promiseFn().then((result) => {
        assert.deepEqual(result, { a: '1'});
    });
});

// Callback test
test('callback test', (done) => {
    setTimeout(function() {
        assert.deepEqual({ a: '1' }, { a: '1'});
        done();
    }, 10);
});

// Async/Await Test
test('callback test', async () => {
    var result = await apiCall();
    assert.deepEqual(result, { success: true });
});

// Generator Test
test('callback test', function* () => {
    var result = yield apiCall();
    assert.deepEqual(result, { success: true });
});
```

ES5
```js
var painless = require('painless');
var test = painless.createGroup();
var assert = painless.assert;

// Sync test
test('sync test', function() {
    assert.deepEqual({ a: '1' }, { a: '1'});
});

// Callback test
test('callback test', function(done) {
    setTimeout(function() {
        assert.deepEqual({ a: '1' }, { a: '1'});
        done();
    }, 10);
});
```

### Assertions
Painless uses Chai and Chai-as-promised. Get more info on all available assertions here. [Chai Assertions](http://chaijs.com/api/assert/).
[Chai-as-promised](https://github.com/domenic/chai-as-promised) adds Promise assertions.

Access Chai
```js
// ES6
import { assert } from 'painless';

// ES5
var painless = require('painless');
var assert = painless.assert;
```
It is possible to use any other assertion library as well. You will receive better errors if the library supports [AssertionError](http://wiki.commonjs.org/wiki/Unit_Testing/1.0#Assert)

### Spying/Stubs/Mocking
Painless comes bundled with Sinon to allow all types of mocking. Get more info here. [Sinon Library](http://sinonjs.org/docs/)

Access Spy
```js
// ES6
import { spy } from 'painless';

// ES5
var painless = require('painless');
var spy = painless.spy;
```

Access Stub
```js
// ES6
import { stub } from 'painless';

// ES5
var painless = require('painless');
var stub = painless.stub;
```

Access Mocks
```js
// ES6
import { mock } from 'painless';

// ES5
var painless = require('painless');
var mock = painless.mock;
```

Accessing other Sinon functionality
```js
// ES6
import { sinon } from 'painless';

const xhr = sinon.useFakeXMLHttpRequest();

// ES5
var painless = require('painless');
var sinon = painless.sinon;

var xhr = sinon.useFakeXMLHttpRequest();
```

### Command Line Options
- --async,-a Run tests async. This will speed up tests that use IO or network. It is not recommended while debugging. It will make tests tough to reason about.
- --bunch,-b Bunch size. If using the async flag, it determines the number of tests to run at the same time. By default this is 10.
- --tap,-t Use tap output reporter instead of the default spec reported


### Code Coverage
Code coverage is really easy to use. Just install istanbul
```
npm install istanbul --save-dev
```
Then you can run coverage by
```
istanbul cover ./node_modules/bin/painless -- test/**/*.js
```

## FAQS
1. Why should I use painless over other test libraries?

Go [here](#comparison) for comparisons to other test libraries. Painless is not groundbreaking in any way. If you like it, use it. It is more important to test your javascript code. The test framework is a minor detail.

2. Why bundle other libraries (Chai, Sinon, etc)? Why not let the user decide?

Painless tries to achieve a test library that just works. The goal is to be able to start writing tests as soon as possible. It is possible to switch out assertion and mocking libraries, but defaults are available.

