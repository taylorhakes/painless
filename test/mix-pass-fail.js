var tap = require('tap')
var assert = require('chai').assert;
var painless = require('../');
var test = tap.test;

test('two fails 2 passes', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    t.equal(body.length, 9);
    t.ok(body[1].indexOf('ok') === 0);
    t.ok(body[2].indexOf('not ok') === 0);
    t.ok(body[3].indexOf('not ok') === 0);
    t.ok(body[4].indexOf('ok') === 0);
    t.equal(body[8], '# fail  2\n');
    t.end();
  });
  harness('success', function() {
    assert(true);
  });
  harness('fail 1', function() {
    assert(false);
  });
  harness('fail 2', function() {
    assert(false);
  });
  harness('success', function() {
    assert(true);
  });
});

test('1 fail 3 passes', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    t.equal(body.length, 9);
    t.ok(body[1].indexOf('not ok') === 0);
    t.ok(body[2].indexOf('ok') === 0);
    t.ok(body[3].indexOf('ok') === 0);
    t.ok(body[4].indexOf('ok') === 0);
    t.equal(body[8], '# fail  1\n');
    t.end();
  });
  harness('fail', function() {
    assert(false);
  });
  harness('success 1', function() {
    assert(true);
  });
  harness('success 2', function() {
    assert(true);
  });
  harness('success 3', function() {
    assert(true);
  });
});
