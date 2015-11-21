var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fnDone = require('function-done');
var DEFAULT_TIMEOUT = 5000;

function getTestArgs(name_, opts_, cb_) {
  var name = '(anonymous)';
  var opts = {};
  var cb;

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    var t = typeof arg;
    if (t === 'string') {
      name = arg;
    }
    else if (t === 'object') {
      opts = arg || opts;
    }
    else if (t === 'function') {
      cb = arg;
    }
  }
  return {name: name, opts: opts, cb: cb};
}

function Test(name_, opts_, cb_) {
  if (!(this instanceof Test)) {
    return new Test(name_, opts_, cb_);
  }

  var args = getTestArgs(name_, opts_, cb_);

  this.name = args.name || (args.cb && args.cb.name) || '(anonymous)';
  this._skip = args.opts.skip || false;
  this._timeout = args.opts.timeout != null ? args.opts.timeout : DEFAULT_TIMEOUT;

  for (var prop in this) {
    this[prop] = (function bind(self, val) {
      if (typeof val === 'function') {
        return function bound() {
          return val.apply(self, arguments);
        };
      }
      else return val;
    })(this, this[prop]);
  }
  this._cb = args.cb;
}

inherits(Test, EventEmitter);

Test.prototype.run = function () {
  var me = this;
  if (!this._cb || this._skip) {
    return this._end(this._getResult(true, {skip: true}));
  }
  if (this._timeout != null) {
    this.timeoutAfter(this._timeout);
  }
  fnDone(this._cb, function (err) {
    if (err) {
      me._fail(null, err);
    } else {
      me._success();
    }
  });
};

Test.prototype.timeoutAfter = function (ms) {
  if (!ms) throw new Error('timeoutAfter requires a timespan');
  var self = this;
  var timeout = setTimeout(function () {
    self._fail('test timed out after ' + ms + 'ms');
  }, ms);
  this.once('end', function () {
    clearTimeout(timeout);
  });
};

Test.prototype._fail = function (message, error) {
  var result = this._getResult(false, {
    error: error
  });
  this._end(result);
};

Test.prototype._success = function () {
  var result = this._getResult(true);
  this._end(result);
};

Test.prototype._end = function (result) {
  if (!this.ended) this.emit('end', result);
  this.ended = true;
};

Test.prototype._getResult = function result(ok, opts) {
  opts = opts || {};
  var extra = opts.extra || {};

  var res = {
    id: 1,
    ok: Boolean(ok),
    skip: opts.skip,
    name: this.name
  };

  if (!ok) {
    res.error = extra.error || opts.error || new Error(res.name);
  }

  return res;
};

Test.skip = function (name_, _opts, _cb) {
  var args = getTestArgs.apply(null, arguments);
  args.opts.skip = true;
  return Test(args.name, args.opts, args.cb);
};

module.exports = Test;
