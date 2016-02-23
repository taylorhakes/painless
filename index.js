var setAsap = require('setasap');
var tap = require('./lib/reporters/tap');
var dot = require('./lib/reporters/dot');
var spec = require('./lib/reporters/spec');
var none = require('./lib/reporters/none');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var createHarness = require('./lib/create-harness');
var path = require('path');
var minimist = require('minimist');
var canExit = typeof process !== 'undefined' && process
  && typeof process.exit === 'function';

/* istanbul ignore next */
var argv = canExit ? minimist(process.argv.slice(2), {
  boolean: ['async'],
  alias: {
    a: 'async',
    b: 'bunch',
    r: 'reporter',
    t: 'tap'
  }
}) : {};

/**
  @deprecated
 */
/* istanbul ignore next */
if (argv.tap) {
  argv.reporter = 'tap';
}

var reporters = {
  dot: dot,
  tap: tap,
  spec: spec,
  none: none
};

chai.use(chaiAsPromised);

var harness = createHarness();

// Allow browser runners to control painless, like karma
/* istanbul ignore next  */
if (typeof window === 'object' && window && window.__PAINLESS__) {
  window.__PAINLESS__.push(harness);
} else {
  setAsap(function asap() {
    var groupOutput = harness.run(argv);
    var processOutput;
    var reporter;
    if (argv.reporter) {
      if (reporters[argv.reporter]) {
        reporter = reporters[argv.reporter];
      } else {
        reporter = require(argv.reporter.indexOf('.') === 0 ? path.resolve(process.cwd(), argv.reporter) : argv.reporter);
      }
      processOutput = reporter(groupOutput);
    } else {
      processOutput = dot(groupOutput);
    }


    var hasError = false;
    groupOutput.on('data', function onData(info) {
      if (info.type === 'end' && info.data.errors.length) {
        hasError = true;
      }
    });

    /* istanbul ignore else */
    if (canExit) {
      groupOutput.on('end', function onEnd() {
        process.exit(hasError ? 1 : 0);
      });
      processOutput.pipe(process.stdout);
    } else {
      processOutput.on('data', function onInfo(result) {
        console.log(result); // eslint-disable-line no-console
      });
    }
  });
}

// Ignore coverage, this is just in case there is an error in painless. Not testable
/* istanbul ignore next */
if (canExit) {
  process.on('unhandledRejection', function onUnhandled(reason) {
    console.error('Unhandled Rejection:', reason.stack); // eslint-disable-line no-console
  });
}

module.exports.createGroup = harness.createGroup;
module.exports.assert = chai.assert;
module.exports.spy = sinon.spy;
module.exports.stub = sinon.stub;
module.exports.mock = sinon.mock;
module.exports.sinon = sinon;
module.exports.chai = chai;

