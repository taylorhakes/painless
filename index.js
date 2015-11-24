var createDefaultStream = require('./lib/default_stream');
var Test = require('./lib/test');
var createResult = require('./lib/results');
var through = require('through');

var canEmitExit = typeof process !== 'undefined' && process
  && typeof process.on === 'function' && process.browser !== true;
var canExit = typeof process !== 'undefined' && process
  && typeof process.exit === 'function';

var loadTest;
var processOn;
var processExit;

require('polyfill-function-prototype-bind');

// Save globals so tests don't affect them
processOn = canEmitExit ? process.on.bind(process) : null;
processExit = canEmitExit ? process.exit.bind(process) : null;

function createHarness(conf_) {
  var results;
  var only = false;
  if (!conf_) {
    conf_ = {};
  }

  results = createResult();
  if (conf_.autoclose !== false) {
    results.once('done', function onDone() {
      results.close();
    });
  }

  function test(name, conf, cb) {
    var t = new Test(name, conf, cb);
    test._tests.push(t);

    (function inspectCode(st) {
      st.on('test', function sub(st_) {
        inspectCode(st_);
      });
      st.on('result', function onResult(r) {
        if (!r.ok && typeof r !== 'string') test._exitCode = 1;
      });
    })(t);

    results.push(t);
    return t;
  }

  test._results = results;
  test._tests = [];
  test.createStream = function createStream(opts) {
    return results.createStream(opts);
  };

  test.only = function testOnly(name) {
    if (only) throw new Error('there can only be one only test');
    results.only(name);
    only = true;
    return test.apply(null, arguments);
  };
  test._exitCode = 0;

  test.close = function close() {
    results.close();
  };

  return test;
}

function createExitHarness(conf) {
  var harness;
  var stream;
  var es;

  if (!conf) conf = {};
  harness = createHarness({
    autoclose: conf.autoclose || false
  });

  stream = harness.createStream({objectMode: conf.objectMode});
  es = stream.pipe(conf.stream || createDefaultStream());
  if (canEmitExit) {
    es.on('error', function onError() {
      harness._exitCode = 1;
    });
  }

  if (conf.exit === false) {
    return harness;
  }
  if (!canEmitExit || !canExit) {
    return harness;
  }

  processOn('exit', function onExit(code) {
    // let the process exit cleanly.
    if (code !== 0) {
      return;
    }

    harness.close();
    processExit(code || harness._exitCode);
  });

  return harness;
}

loadTest = (function loadTestFn() {
  var harness;

  function getHarness(opts) {
    if (!opts) opts = {};
    opts.autoclose = !canEmitExit;
    if (!harness) harness = createExitHarness(opts);
    return harness;
  }

  function lazyLoad() {
    return getHarness().apply(this, arguments);
  }

  lazyLoad.only = function only() {
    return getHarness().only.apply(this, arguments);
  };

  lazyLoad.createStream = function createStream(opts) {
    var output;

    if (!opts) {
      opts = {};
    }
    if (!harness) {
      output = through();
      getHarness({stream: output, objectMode: opts.objectMode});
      return output;
    }
    return harness.createStream(opts);
  };

  lazyLoad.getHarness = getHarness;

  return lazyLoad;
})();

module.exports = loadTest;
module.exports.createHarness = createHarness;
