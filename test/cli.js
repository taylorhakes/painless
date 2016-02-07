var exec = require('child_process').exec;
var tap = require('tap');
var test = tap.test;


test('command sync', function(t) {
  exec('node examples/sync', function (error, stdout, stderr) {
    t.equal(stdout, '    ✔ simple sync pass\n    ✔ simple sync pass 2\n\n  passed!\n\n');
    t.end();
  });
});

test('command sync --tap', function(t) {
  exec('node examples/sync --tap', function (error, stdout, stderr) {
    t.equal(stdout.indexOf('ok 1 simple sync pass\nok 2 simple sync pass 2\n\n1..2\n# tests 2\n# pass  2\n\n# ok\n'), 0);
    t.end();
  });
});

test('error sync', function(t) {
  exec('node examples/sync-error', function (error, stdout, stderr) {
    t.ok(error);
    t.end();
  });
});

test('command callback', function(t) {
  exec('node examples/callback', function (error, stdout, stderr) {
    t.equal(stdout, '    ✔ callback 1\n\n  passed!\n\n');
    t.end();
  });
});

test('invalid assertion', function(t) {
  exec('node test/fixtures/string-error-test', function (error, stdout, stderr) {
    t.ok(error);
    t.equal(stdout, '\n    ✖ string assertion\n    -------------------\n      error: |-\n        hello\n\n\n  failed!\n\n');
    t.end();
  });
});