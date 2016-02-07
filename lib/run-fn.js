'use strict';

var fnDone = require('function-done');
var PromiseM = typeof Promise === 'function' ? Promise : require('promise-polyfill');

function getError(fnObj, error) {
  var res = {
    name: fnObj.name
  };

  if (error.hasOwnProperty('expected')) {
    res.expected = error.expected;
  }
  if (error.hasOwnProperty('actual')) {
    res.actual = error.actual;
  }
  res.error = {
    message: typeof error === 'string' ? error : error.message,
    stack: error.stack
  };

  return res;
}

function getSuccess(fnObj) {
  return {
    name: fnObj.name
  };
}

function runFn(fnObj) {
  var timeout;

  return new PromiseM(function prom(resolve, reject) {
    timeout = setTimeout(function onTimeout() {
      reject(getError(fnObj, new Error('test timed out after ' + fnObj.timeout + 'ms')));
    }, fnObj.timeout);

    fnDone(fnObj.cb, function onFnDone(err) {
      clearTimeout(timeout);

      if (err) {
        reject(getError(fnObj, err));
      } else {
        resolve(getSuccess(fnObj));
      }
    });
  });
}

module.exports = runFn;
