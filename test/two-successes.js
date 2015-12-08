var tap = require('tap')
var assert = require('chai').assert;
var painless = require('../');
var test = tap.test;

test('two success sync', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    assert.deepEqual([
      'TAP version 13\n',
      'ok 1 success 1\n',
      'ok 2 success 2\n',
      '\n1..2\n',
      '# tests 2\n',
      '# pass  2\n',
      '\n# ok\n'
    ], body);
    t.end();
  });
  harness('success 1', function() {
    assert(true);
  });
  harness('success 2', function() {
    assert(true);
  });
});

test('two success callback', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    assert.deepEqual([
      'TAP version 13\n',
      'ok 1 success 1\n',
      'ok 2 success 2\n',
      '\n1..2\n',
      '# tests 2\n',
      '# pass  2\n',
      '\n# ok\n'
    ], body);
    t.end();
  });
  harness('success 1', function(done) {
    setTimeout(function() {
      assert(true);
      done();
    }, 10);
  });
  harness('success 2', function(done) {
    setTimeout(function() {
      assert(true);
      done();
    }, 10);
  });
});
