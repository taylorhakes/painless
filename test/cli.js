var exec = require('child_process').exec;
var tap = require('tap');
var test = tap.test;


test('command sync', function(t) {
  exec('node examples/sync', function (error, stdout, stderr) {
    t.match(stdout, /  ..\n\n  [0-9]+ ms\n  2 tests\n  2 passed\n\n  Pass!/);
    t.end();
  });
});

test('command sync -r=tap', function(t) {
  exec('node examples/sync -r=tap', function (error, stdout, stderr) {
    t.match(stdout, /ok 1 simple sync pass\nok 2 simple sync pass 2\n\n1..2\n# tests 2\n# pass  2\n# time [0-9]+ms\n# passed!\n/);
    t.end();
  });
});

test('command sync -r=spec', function(t) {
  exec('node examples/sync -r=spec', function (error, stdout, stderr) {
    t.match(stdout, /  ✔ simple sync pass\n  ✔ simple sync pass 2\n\n\n  [0-9]+ ms\n  2 tests\n  2 passed\n\n  Pass!\n/);
    t.end();
  });
});

test('command sync custom reporter', function(t) {
  exec('node examples/sync -r=./examples/custom-reporter', function (error, stdout, stderr) {
    t.match(stdout, /simple sync pass success!\nsimple sync pass 2 success!\n/);
    t.end();
  });
});

test('command sync custom reporter fail', function(t) {
  exec('node examples/sync-error -r=./examples/custom-reporter', function (error, stdout, stderr) {
    t.match(stdout, /simple sync pass failed!\nsimple sync pass 2 failed!\n/);
    t.end();
  });
});

test('command sync -r=nyan does not exist', function(t) {
  exec('node examples/sync -r=nyan', function (error, stdout, stderr) {
    t.ok(error);
    t.end();
  });
});


test('error sync', function(t) {
  exec('node examples/sync-error', function (error, stdout, stderr) {
    t.ok(error);
    t.end();
  });
});

test('error sync tap', function(t) {
  exec('node examples/sync-error -r=tap', function (error, stdout, stderr) {
    t.ok(error);
    t.end();
  });
});

test('error sync spec', function(t) {
  exec('node examples/sync-error -r=spec', function (error, stdout, stderr) {
    t.ok(error);
    t.end();
  });
});

test('command callback', function(t) {
  exec('node examples/callback', function (error, stdout, stderr) {
    t.match(stdout, /  .\n\n  [0-9]+ ms\n  1 tests\n  1 passed\n\n  Pass!/);
    t.end();
  });
});

test('invalid assertion', function(t) {
  exec('node test/fixtures/string-error-test', function (error, stdout, stderr) {
    t.ok(error);
    t.match(stdout, /  x\n\n  [0-9]+ ms\n  1 tests\n  0 passed\n  1 failed\n\n  Failed Tests:\n   x string assertion\n     hello\n      \n/);
    t.end();
  });
});

test('invalid assertion tap', function(t) {
  exec('node test/fixtures/string-error-test -r=tap', function (error, stdout, stderr) {
    t.ok(error);
    t.match(stdout, /not ok 1 string assertion\n  ---\n    error: |-\n      hello\n  ...\n\n1..1\n# tests 1\n# pass  0\n# fail  1\n# time [0-9]+ms\n# failed!\n/);
    t.end();
  });
});

test('invalid assertion spec', function(t) {
  exec('node test/fixtures/string-error-test -r=spec', function (error, stdout, stderr) {
    t.ok(error);
    t.match(stdout, /  ✖ string assertion\n     hello\n      \n\n\n  [0-9]+ ms\n  1 tests\n  0 passed\n  1 failed\n/);
    t.end();
  });
});