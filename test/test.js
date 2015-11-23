var tap = require('tap')
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
    t.deepEqual(val, {
      id:   1,
      ok:   true,
      skip: true,
      name: 'hello'
    });
    t.end();
  });
  tes.run();
});

test('skip in options', function(t) {
  var tes = Test('hello', noop, {skip: true});
  tes.on('end', function(val) {
    t.deepEqual(val, {
      id:   1,
      ok:   true,
      skip: true,
      name: 'hello'
    });
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