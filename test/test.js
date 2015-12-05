var tap = require('tap')
var assert = require('chai').assert;
var Test = require('../lib/test');
var Promise  = require('promise-polyfill');
var Observable = require("zen-observable");
var through = require('through');
var cp = require('child_process');
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

test('skip', function(t) {
  var tes = Test.skip('hello', noop);
  tes.on('end', function(val) {
    t.is(val.skip, true);
    t.end();
  });
  tes.run();
});

test('skip in options', function(t) {
  var tes = Test('hello', noop, {skip: true});
  tes.on('end', function(val) {
    t.is(val.skip, true);
    t.end();
  });
  tes.run();
});

test('timeout', function(t) {
  var tes = Test('hello', function(done) {}, {timeout: 10});
  tes.on('end', function(val) {
    t.is(val.error.message, 'test timed out after 10ms');
    t.end();
  });
  tes.run();
});

test('no callback skipped', function(t) {
  var tes = Test('hello');
  tes.on('end', function(val) {
    t.is(val.skip, true);
    t.end();
  });
  tes.run();
});

test('passing test', function(t) {
  var tes = Test('hello', function() {
    assert(true);
  });
  tes.on('end', function(val) {
    t.is(val.ok, true);
    t.end();
  });
  tes.run();
});

test('failing test', function(t) {
  var tes = Test('hello', function() {
    assert.equal(false, true);
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.actual, false);
    t.is(val.expected, true);
    t.end();
  });
  tes.run();
});

test('failing test callback', function(t) {
  var tes = Test('hello', function(done) {
    setTimeout(function() {
      assert.equal(1, 2);
      done();
    }, 10);
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.actual, 1);
    t.is(val.expected, 2);
    t.end();
  });
  tes.run();
});

test('failing test callback with error', function(t) {
  var tes = Test('hello', function(done) {
    setTimeout(function() {
      done(new Error());
    }, 10);
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.end();
  });
  tes.run();
});

test('passing callback', function(t) {
  var tes = Test('hello', function(done) {
    setTimeout(function() {
      assert(true);
      done();
    }, 10);
  });
  tes.on('end', function(val) {
    t.is(val.ok, true);
    t.end();
  });
  tes.run();
});

test('failing Promise', function(t) {
  var tes = Test('hello', function() {
    return Promise.resolve(10).then(function() {
      assert.equal(1, 2);
    });
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.actual, 1);
    t.is(val.expected, 2);
    t.end();
  });
  tes.run();
});

test('fail before Promise created', function(t) {
  var tes = Test('hello', function() {
    assert.equal(1, 2);
    return Promise.resolve(10);
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.actual, 1);
    t.is(val.expected, 2);
    t.end();
  });
  tes.run();
});

test('passing Promise', function(t) {
  var value;
  var tes = Test('hello', function() {
    return Promise.resolve(10).then(function() {
      assert(true);
      value = 1;
    });
  });
  tes.on('end', function(val) {
    t.is(val.ok, true);
    t.is(value, 1);
    t.end();
  });
  tes.run();
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
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.actual, 1);
    t.is(val.expected, 2);
    t.end();
  });
  tes.run();
});

test('failing Observable map', function(t) {
  var tes = Test('test failing observable', function() {
    return Observable.of([1,2,3]).map(function(val) {
      assert.equal(3, 4);
      return 1;
    });
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.actual, 3);
    t.is(val.expected, 4);
    t.end();
  });
  tes.run();
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
  tes.on('end', function(val) {
    t.is(val.ok, true);
    t.end();
  });
  tes.run();
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
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.is(val.error.message, 'invalid stream');
    t.end();
  });
  tes.run();
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
  tes.on('end', function(val) {
    t.is(val.ok, true);
    t.end();
  });
  tes.run();
});

test('failing process', function(t) {
  var tes = Test('test failing observable', function() {
    return cp.exec('foo-bar-baz hello world');
  });
  tes.on('end', function(val) {
    t.is(val.ok, false);
    t.end();
  });
  tes.run();
});

test('passing process', function(t) {
  var tes = Test('test failing observable', function() {
    return cp.exec('echo hello world');
  });
  tes.on('end', function(val) {
    t.is(val.ok, true);
    t.end();
  });
  tes.run();
});