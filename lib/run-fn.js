'use strict';

var fnDone = require('function-done');
var objectAssign = require('object-assign');
/* istanbul ignore next */
var PromiseM = typeof Promise === 'function' ? Promise : require('promise-polyfill');
var now = Date.now;

function getError(fnObj, time, error) {
  var res = getSuccess(fnObj, time);
  res.success = false;
  res.error = {
    message: typeof error === 'string' ? error : error.message,
    stack: error.stack
  };
  if (error.hasOwnProperty('expected')) {
    res.error.expected = error.expected;
  }
  if (error.hasOwnProperty('actual')) {
    res.error.actual = error.actual;
  }

  return res;
}

function getSuccess(fnObj, time) {
  var info = objectAssign({ time: time, error: null, success: true }, fnObj);
  delete info.isTest;
  return info;
}

function runFn(fnObj) {
  var timeout;

  return new PromiseM(function prom(resolve) {
    timeout = setTimeout(function onTimeout() {
      resolve(getError(fnObj, fnObj.timeout, new Error('test timed out after ' + fnObj.timeout + 'ms')));
    }, fnObj.timeout);

    var start = now();
    fnDone(fnObj.cb, function onFnDone(err) {
      clearTimeout(timeout);
      var time = now() - start;
      if (err) {
        resolve(getError(fnObj, time, err));
      } else {
        resolve(getSuccess(fnObj, time));
      }
    });
  });
}

module.exports = runFn;
