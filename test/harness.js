var tap = require('tap');
var Harness = require('../harness');
var Promise  = require('promise-polyfill');
var through = require('through');
var assert = require('chai').assert;
var test = tap.test;
var MY_MESSAGE = 'my assertion message';
function noop() {}
function error() {
  assert(false, MY_MESSAGE);
}

test('harness single group all pass', function(t) {
  var har = Harness();
  var test = har.createTest();
  t.plan(2);

  test('test1', noop);
  test('test2', noop);

  var output = har.run();
  var index = 0;
  output.on('data', function(data) {
    if (index === 0) {
      t.same({ name: 'test1', success: true }, data);
      index++;
    } else {
      t.same({ name: 'test2', success: true }, data);
    }
  });
  output.on('end', t.end);
});

test('harness single group all pass beforeEach and afterEach', function(t) {
  var har = Harness();
  var test = har.createTest();
  var beforeCalled = false;
  var afterCalled = false;
  t.plan(4);

  test.beforeEach(function() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        beforeCalled = true;
        resolve();
      }, 10);
    });
  });

  test.afterEach(function() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        afterCalled = true;
        resolve();
      }, 10);
    });
  });

  test('test1', noop);
  test('test2', noop);

  var output = har.run();
  var index = 0;
  output.on('data', function(data) {
    if (index === 0) {
      t.ok(beforeCalled);
      t.same({ name: 'test1', success: true }, data);
    } else {
      t.ok(afterCalled);
      t.same({ name: 'test2', success: true }, data);
    }
    index++;
  });
  output.on('end', t.end);
});

test('success multiple errors', function(t) {
  var har = Harness();
  var test = har.createTest();

  test('test1', error);
  test('test2', noop);
  test('test3', error);

  var output = har.run();
  var index = 0;
  output.on('data', function(data) {
    if (index === 0) {
      t.equal(data.name, 'test1');
      t.notOk(data.success);
      t.equal(data.error.message, MY_MESSAGE);
    } else if (index === 1) {
      t.same({ name: 'test2', success: true }, data);
    } else {
      t.equal(data.name, 'test3');
      t.notOk(data.success);
      t.equal(data.error.message, MY_MESSAGE);
    }
    index++;
  });
  output.on('end', t.end);
});

test('multiple groups', function(t) {
  var har = Harness();
  var test1 = har.createTest();
  var test2 = har.createTest();

  test1('test1', error);
  test2('test2', noop);

  var output = har.run();
  var index = 0;
  output.on('data', function(data) {
    if (index === 0) {
      t.equal(data.name, 'test1');
      t.notOk(data.success);
      t.equal(data.error.message, MY_MESSAGE);
    } else {
      t.same({ name: 'test2', success: true }, data);
    }
    index++;
  });
  output.on('end', t.end);
});

test('group without tests', function(t) {
  var har = Harness();
  har.createTest();
  var output = har.run();
  output.on('end', t.end);
});