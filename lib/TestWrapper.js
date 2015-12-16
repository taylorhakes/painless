var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fnDone = require('function-done');
var DEFAULT_TIMEOUT = 5000;

require('polyfill-function-prototype-bind');

function getTestArgs(/* name_, _opts, _cb */) {
  var name;
  var opts = {};
  var cb;
  var i;
  var arg;
  var t;

  for (i = 0; i < arguments.length; i++) {
    arg = arguments[i];
    t = typeof arg;
    if (t === 'string') {
      name = arg;
    } else if (t === 'object') {
      opts = arg || opts;
    } else if (t === 'function') {
      cb = arg;
    }
  }
  return {name: name, opts: opts, cb: cb};
}

function Test(name_, opts_, cb_) {
  var args;

  if (!(this instanceof Test)) {
    return new Test(name_, opts_, cb_);
  }

  args = getTestArgs(name_, opts_, cb_);

  this.name = args.name || (args.cb && args.cb.name) || '(anonymous)';
  this._skip = args.opts.skip || false;
  this._timeout = args.opts.timeout != null ? args.opts.timeout : DEFAULT_TIMEOUT;

  this._cb = args.cb;

}

inherits(Test, EventEmitter);

Test.prototype.run = function run() {
  var me = this;
  if (!this._cb || this._skip) {
    return this._end(this._getResult(true, {skip: true}));
  }
  this._timeoutAfter(this._timeout);

  fnDone(this._cb, function onFnDone(err) {
    if (err) {
      me._fail(null, err);
    } else {
      me._success();
    }
  });
};

Test.prototype._timeoutAfter = function _timeoutAfter(ms) {
  var me = this;
  var timeout;

  timeout = setTimeout(function onTimeout() {
    me._fail('test timed out after ' + ms + 'ms');
  }, ms);
  this.once('end', function onEnd() {
    clearTimeout(timeout);
  });
};

Test.prototype._fail = function _fail(message, error) {
  var result = this._getResult(false, {
    error: error,
    message: message
  });
  this._end(result);
};

Test.prototype._success = function _success() {
  var result = this._getResult(true);
  this._end(result);
};

Test.prototype._end = function _end(result) {
  if (!this.ended) this.emit('end', result);
  this.ended = true;
};

Test.prototype._getResult = function result(ok, opts) {
  var res;
  var error;

  opts = opts || {};

  res = {
    id: 1,
    ok: Boolean(ok),
    skip: opts.skip,
    name: this.name
  };

  if (!ok) {
    error = opts.error || new Error(opts.message);
    if (error.hasOwnProperty('expected')) {
      res.expected = error.expected;
    }
    if (error.hasOwnProperty('actual')) {
      res.actual = error.actual;
    }
    res.error = error;
  }

  return res;
};

Test.skip = function skip(/* name_, _opts, _cb */) {
  var args = getTestArgs.apply(null, arguments);
  args.opts.skip = true;
  return new Test(args.name, args.opts, args.cb);
};

module.exports = Test;
