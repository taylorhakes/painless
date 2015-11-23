var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var through = require('through');
var resumer = require('resumer');
var setAsap = require('setasap');

require('polyfill-function-prototype-bind');

function getNextTest(results) {
  var t;

  if (!results._only) {
    return results.tests.shift();
  }

  do {
    t = results.tests.shift();
    if (!t) {
      continue;
    }
    if (results._only === t.name) {
      return t;
    }
  } while (results.tests.length !== 0);
}

function encodeResult(res, count) {
  var output = '';
  var outer;
  var inner;
  var lines;
  var i;

  output += (res.ok ? 'ok ' : 'not ok ') + count;
  output += res.name ? ' ' + res.name.toString().replace(/\s+/g, ' ') : '';

  if (res.skip) output += ' # SKIP';
  else if (res.todo) output += ' # TODO';

  output += '\n';
  if (res.ok) return output;

  outer = '  ';
  inner = outer + '  ';
  output += outer + '---\n';

  if (res.error) {
    if (res.error.stack) {
      lines = String(res.error.stack).split('\n');

      output += inner + 'error: |-\n';
      for (i = 0; i < lines.length; i++) {
        output += inner + '  ' + lines[i] + '\n';
      }
    }
  }

  output += outer + '...\n';
  return output;
}

function handleNext(next) {
  return function onEnd() {
    setAsap(next);
  };
}

function Results() {
  if (!(this instanceof Results)) return new Results;
  this.count = 0;
  this.fail = 0;
  this.pass = 0;
  this._stream = through();
  this.tests = [];
}

inherits(Results, EventEmitter);

Results.prototype.createStream = function createStream(opts) {
  var output;
  var testId;
  var me = this;

  if (!opts) {
    opts = {};
  }
  testId = 0;

  if (opts.objectMode) {
    output = through();
    this.on('_push', function onPush(t) {
      var id = testId++;
      t.on('end', function onEnd(res) {
        res.id = id;
        res.type = 'test';
        res.name = t.name;
        output.queue(res);
      });
    });
    this.on('done', function onDone() {
      output.queue(null);
    });
  } else {
    output = resumer();
    output.queue('TAP version 13\n');
    this._stream.pipe(output);
  }

  setAsap(function next() {
    var t = getNextTest(me);
    while (t) {
      t.run();
      if (!t.ended) {
        return t.once('end', handleNext(next));
      }

      t = getNextTest(me);
    }
    me.emit('done');
  });

  return output;
};

Results.prototype.push = function push(t) {
  var me = this;
  me.tests.push(t);
  me._watch(t);
  me.emit('_push', t);
};

Results.prototype.only = function only(name) {
  this._only = name;
};

Results.prototype._watch = function _watch(t) {
  var me = this;

  function write(s) {
    me._stream.queue(s);
  }

  t.on('end', function onEnd(res) {
    if (typeof res === 'string') {
      write('# ' + res + '\n');
      return;
    }
    write(encodeResult(res, me.count + 1));
    me.count++;

    if (res.ok) {
      me.pass++;
    } else {
      me.fail++;
    }
  });
};

Results.prototype.close = function close() {
  var me = this;

  if (me.closed) {
    me._stream.emit('error', new Error('ALREADY CLOSED'));
  }
  me.closed = true;
  function write(s) {
    me._stream.queue(s);
  }

  write('\n1..' + me.count + '\n');
  write('# tests ' + me.count + '\n');
  write('# pass  ' + me.pass + '\n');
  if (me.fail) {
    write('# fail  ' + me.fail + '\n');
  } else {
    write('\n# ok\n');
  }

  write(null);
};

module.exports = Results;
