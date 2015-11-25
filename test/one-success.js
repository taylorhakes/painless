var tap = require('tap')
var assert = require('chai').assert;
var painless = require('../');
var test = tap.test;

test('one success sync', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    assert.deepEqual([
      'TAP version 13\n',
      'ok 1 success\n',
      '\n1..1\n',
      '# tests 1\n',
      '# pass  1\n',
      '\n# ok\n'
    ], body);
    t.end();
  });
  harness('success', function() {
    assert(true);
  });
});

test('one success callback', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    assert.deepEqual([
      'TAP version 13\n',
      'ok 1 success\n',
      '\n1..1\n',
      '# tests 1\n',
      '# pass  1\n',
      '\n# ok\n'
    ], body);
    t.end();
  });
  harness('success', function(done) {
    setTimeout(function() {
      assert(true);
      done();
    }, 10);
  });
});
