'use strict';

var tap = require('tap');
var assert = require('chai').assert;
var Test = require('../lib/fn-obj');
var Promise  = require('promise-polyfill');
var Observable = require("zen-observable");
var through = require('through');
var cp = require('child_process');
var runFn = require('../lib/run-fn');
var test = tap.test;
var noop = function() {};

test('creates a new instance', function(t) {
  var tes = new Test('hello', noop);
  t.type(tes, Test);
  t.end();
});
test('creates a new instance without new', function(t) {
  var tes = Test('hello', noop);
  t.type(tes, Test);
  t.end();
});

test('name correct', function(t) {
  var tes = Test('hello', noop);
  t.is(tes.name, 'hello');
  t.end();
});

test('options in multiple order', function(t) {
  var tes = Test(noop, 'hello', {});
  t.is(tes.name, 'hello');
  t.end();
});

test('options in other order', function(t) {
  var tes = Test({}, noop, 'hello');
  t.is(tes.name, 'hello');
  t.end();
});

test('timeout', function(t) {
  var tes = Test('hello', function(done) {}, {timeout: 10});
  runFn(tes).catch(function(val) {
    t.is(val.error.message, 'test timed out after 10ms');
    t.end();
  });
});

test('no callback error', function(t) {
  var error = false;
  try {
    var tes = Test('hello');
  } catch(e) {
    error = true;
  }
  t.is(error, true);
  t.end();
});

test('null options', function(t) {
  var tes = Test('hello', null, function() {
    assert(true);
  });
  runFn(tes).then(function() {
    t.end();
  });
});

test('use function name', function (t) {
  var tes = Test(function useFunctionName() {
    assert(true);
  });
  runFn(tes).then(function() {
    t.is(tes.name, 'useFunctionName');
    t.end();
  });
});

test('anonymous function name', function (t) {
  var tes = Test(function () {
    assert(true);
  });
  runFn(tes).then(function() {
    t.is(tes.name, '(anonymous)');
    t.end();
  });
});

test('run test twice', function (t) {
  var tes = Test('run test twice', function () {
    assert(true);
  });
  Promise.all([
    runFn(tes),
    runFn(tes)
  ]).then(function() {
    t.end();
  });
});

test('failing test', function(t) {
  var tes = Test('hello', function() {
    assert.equal(false, true);
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.actual, false);
    t.is(val.error.expected, true);
    t.end();
  });
});

test('failing test callback', function(t) {
  var tes = Test('hello', function(done) {
    setTimeout(function() {
      assert.equal(1, 2);
      done();
    }, 10);
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.actual, 1);
    t.is(val.error.expected, 2);
    t.end();
  });
});

test('failing test callback with error', function(t) {
  var tes = Test('hello', function(done) {
    setTimeout(function() {
      done(new Error());
    }, 10);
  });
  runFn(tes).catch(function() {
    t.end();
  });
});

test('passing callback', function(t) {
  var tes = Test('hello', function(done) {
    setTimeout(function() {
      assert(true);
      done();
    }, 10);
  });
  runFn(tes).then(function() {
    t.end();
  });
});

test('failing Promise', function(t) {
  var tes = Test('hello', function() {
    return Promise.resolve(10).then(function() {
      assert.equal(1, 2);
    });
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.actual, 1);
    t.is(val.error.expected, 2);
    t.end();
  });
});

test('fail before Promise created', function(t) {
  var tes = Test('hello', function() {
    assert.equal(1, 2);
    return Promise.resolve(10);
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.actual, 1);
    t.is(val.error.expected, 2);
    t.end();
  });
});

test('passing Promise', function(t) {
  var value;
  var tes = Test('hello', function() {
    return Promise.resolve(10).then(function() {
      assert(true);
      value = 1;
    });
  });
  runFn(tes).then(function() {
    t.is(value, 1);
    t.end();
  });
});

test('failing Observable', function(t) {
  var tes = Test('test failing observable', function() {
    return new Observable(function(observer) {
      observer.next(8);
      observer.next(9);

      // Failing assert
      assert.equal(1, 2);
      observer.complete();
    });
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.actual, 1);
    t.is(val.error.expected, 2);
    t.end();
  });
});

test('failing Observable map', function(t) {
  var tes = Test('test failing observable', function() {
    return Observable.of([1,2,3]).map(function() {
      assert.equal(3, 4);
      return 1;
    });
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.actual, 3);
    t.is(val.error.expected, 4);
    t.end();
  });
});

test('passing observable', function(t) {
  var tes = Test('test failing observable', function() {
    return new Observable(function(observer) {
      observer.next(8);
      observer.next(9);

      // Passing assert
      assert.equal(2, 2);
      observer.complete();
    });
  });
  runFn(tes).then(function() {
    t.end();
  });
});

test('failing stream', function(t) {
  var tes = Test('test failing observable', function() {
    var stream = through();
    setTimeout(function() {
      stream.emit('error', new Error('invalid stream'));
      stream.destroy();
    }, 10);

    return stream;
  });
  runFn(tes).catch(function(val) {
    t.is(val.error.message, 'invalid stream');
    t.end();
  });
});

test('passing stream', function(t) {
  var tes = Test('test failing observable', function() {
    var stream = through();
    setTimeout(function() {
      stream.queue(1);
      stream.queue(null);
      stream.destroy();
    }, 10);

    return stream;
  });
  runFn(tes).then(function() {
    t.end();
  });
});

test('failing process', function(t) {
  var tes = Test('test failing process', function() {
    return cp.exec('foo-bar-baz hello world');
  });
  runFn(tes).catch(function() {
    t.end();
  });
});

test('passing process', function(t) {
  var tes = Test('test passing process', function() {
    return cp.exec('echo hello world');
  });
  runFn(tes).then(function() {
    t.end();
  });
});