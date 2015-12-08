var tap = require('tap')
var assert = require('chai').assert;
var painless = require('../');
var test = tap.test;

test('two fails sync', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    t.equal(body.length, 7);
    t.ok(body[1].indexOf('not ok') === 0);
    t.ok(body[2].indexOf('not ok') === 0);
    t.equal(body[6], '# fail  2\n');
    t.end();
  });
  harness('success', function() {
    assert(false);
  });
  harness('success', function() {
    assert(false);
  });
});

test('two fails callback', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    t.equal(body.length, 7);
    t.ok(body[1].indexOf('not ok') === 0);
    t.ok(body[2].indexOf('not ok') === 0);
    t.equal(body[6], '# fail  2\n');
    t.end();
  });
  harness('fail', function(done) {
    setTimeout(function() {
      assert(false);
      done();
    }, 10);
  });
  harness('fail', function(done) {
    setTimeout(function() {
      assert(false);
      done();
    }, 10);
  });
});
