var tap = require('tap')
var assert = require('chai').assert;
var painless = require('../');
var test = tap.test;

test('one fail', function(t) {
  var harness = painless.createHarness({ exit: false });
  var stream = harness.createStream();
  var body = [];
  stream.on('data', function(result) {
    body.push(result);
  });
  stream.on('end', function() {
    t.equal(body.length, 6);
    t.ok(body[1].indexOf('not ok') === 0);
    t.equal(body[5], '# fail  1\n');
    t.end();
  });
  harness('success', function() {
    assert(false);
  });
});
