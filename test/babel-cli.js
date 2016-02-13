var exec = require('child_process').exec;
var tap = require('tap');
var test = tap.test;

test('babel command sync', function(t) {
  exec('babel-node test/fixtures/babel-sync', function (err) {
    t.notOk(err);
    t.end();
  });
});

test('babel command async promise error', function(t) {
  exec('babel-node test/fixtures/babel-promise-error', function (err) {
    t.ok(err);
    t.end();
  });
});

test('babel command await error', function(t) {
  exec('babel-node test/fixtures/babel-await-error', function (err) {
    t.ok(err);
    t.end();
  });
});

test('babel command generator error', function(t) {
  exec('babel-node test/fixtures/generator', function (err) {
    t.ok(err);
    t.end();
  });
});