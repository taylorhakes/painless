var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var through = require('through');
var resumer = require('resumer');
var setAsap = require('setasap');

function getNextTest(results) {
  if (!results._only) {
    return results.tests.shift();
  }

  do {
    var t = results.tests.shift();
    if (!t) continue;
    if (results._only === t.name) {
      return t;
    }
  } while (results.tests.length !== 0)
}

function encodeResult(res, count) {
  var output = '';
  output += (res.ok ? 'ok ' : 'not ok ') + count;
  output += res.name ? ' ' + res.name.toString().replace(/\s+/g, ' ') : '';

  if (res.skip) output += ' # SKIP';
  else if (res.todo) output += ' # TODO';

  output += '\n';
  if (res.ok) return output;

  var outer = '  ';
  var inner = outer + '  ';
  output += outer + '---\n';

  if (res.error) {
    if (res.error.stack) {
      var lines = String(res.error.stack).split('\n');

      output += inner + 'error: |-\n';
      for (var i = 0; i < lines.length; i++) {
        output += inner + '  ' + lines[i] + '\n';
      }
    }
  }

  output += outer + '...\n';
  return output;
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

Results.prototype.createStream = function (opts) {
  if (!opts) opts = {};
  var self = this;
  var output, testId = 0;
  if (opts.objectMode) {
    output = through();
    self.on('_push', function ontest(t) {
      var id = testId++;
      t.on('end', function (res) {
        res.id = id;
        res.type = 'test';
        res.name = t.name;
        output.queue(res);
      });
    });
    self.on('done', function () {
      output.queue(null)
    });
  }
  else {
    output = resumer();
    output.queue('TAP version 13\n');
    self._stream.pipe(output);
  }

  setAsap(function next() {
    var t;
    while (t = getNextTest(self)) {
      t.run();
      if (!t.ended) return t.once('end', function () {
        setAsap(next);
      });
    }
    self.emit('done');
  });

  return output;
};

Results.prototype.push = function (t) {
  var self = this;
  self.tests.push(t);
  self._watch(t);
  self.emit('_push', t);
};

Results.prototype.only = function (name) {
  if (this._only) {
    self.count++;
    self.fail++;
    write('not ok ' + self.count + ' already called .only()\n');
  }
  this._only = name;
};

Results.prototype._watch = function (t) {
  var self = this;
  var write = function (s) {
    self._stream.queue(s)
  };
  t.on('end', function (res) {
    if (typeof res === 'string') {
      write('# ' + res + '\n');
      return;
    }
    write(encodeResult(res, self.count + 1));
    self.count++;

    if (res.ok) self.pass++;
    else self.fail++
  });
};

Results.prototype.close = function () {
  var self = this;
  if (self.closed) self._stream.emit('error', new Error('ALREADY CLOSED'));
  self.closed = true;
  var write = function (s) {
    self._stream.queue(s)
  };

  write('\n1..' + self.count + '\n');
  write('# tests ' + self.count + '\n');
  write('# pass  ' + self.pass + '\n');
  if (self.fail) {
    write('# fail  ' + self.fail + '\n');
  } else {
    write('\n# ok\n');
  }

  self._stream.queue(null);
};

module.exports = Results;
