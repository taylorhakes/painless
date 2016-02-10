'use strict';

var DEFAULT_TIMEOUT = 10000;

function getFnArgs(/* name_, _opts, _cb */) {
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

function Fn(name_, opts_, cb_) {
  var args;

  if (!(this instanceof Fn)) {
    return new Fn(name_, opts_, cb_);
  }

  args = getFnArgs(name_, opts_, cb_);

  this.name = args.name || (args.cb && args.cb.name) || '(anonymous)';
  this.timeout = args.opts.timeout != null ? args.opts.timeout : DEFAULT_TIMEOUT;
  this.cb = args.cb;
  this.isTest = false;
  this.options = args.opts;

  if (!this.cb) {
    throw new Error('Invalid test `' + this.name + '`. No test function defined.');
  }
}

module.exports = Fn;
