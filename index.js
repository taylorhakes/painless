var setAsap = require('setasap');
var tap = require('./lib/reporters/tap');
var json = require('./lib/reporters/json');
var dot = require('./lib/reporters/dot');
var spec = require('./lib/reporters/spec');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var createHarness = require('./lib/create-harness');
var argv = require('minimist')(process.argv.slice(2), {
  boolean: ['async', 'tap'],
  alias: {
    a: 'async',
    b: 'bunch',
    t: 'tap',
    r: 'reporter'
  }
});

var reporters = {
  dot: dot,
  json: json,
  tap: tap,
  spec: spec
};

chai.use(chaiAsPromised);

var harness = createHarness();

setAsap(function asap() {
  var groupOutput = harness.run(argv);
  var processOutput;
  if (argv.reporter) {
    if (!reporters[argv.reporter]) {
      throw new Error(argv.reporter + ' is not a valid reporter');
    }
    processOutput = reporters[argv.reporter](groupOutput);
  } else {
    processOutput = dot(groupOutput);
  }


  var hasError = false;
  groupOutput.on('data', function onData(info) {
    if (info.type === 'end' && info.data.errors.length) {
      hasError = true;
    }
  });
  groupOutput.on('end', function onEnd() {
    process.exit(hasError ? 1 : 0);
  });
  processOutput.pipe(process.stdout);
});

module.exports.createGroup = harness.createGroup;
module.exports.assert = chai.assert;
module.exports.spy = sinon.spy;
module.exports.stub = sinon.stub;
module.exports.mock = sinon.mock;
module.exports.sinon = sinon;
module.exports.chai = chai;

