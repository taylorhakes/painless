var tap = require('tap')
var assert = require('chai').assert;
var Test = require('../lib/test');
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
