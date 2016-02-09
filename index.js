var setAsap = require('setasap');
var tap = require('./lib/reporters/tap');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var tapSpec = require('tap-spec');
var createHarness = require('./lib/create-harness');
var argv = require('minimist')(process.argv.slice(2), {
  boolean: ['async', 'tap'],
  alias: {
    a: 'async',
    b: 'bunch',
    t: 'tap'
  }
});

chai.use(chaiAsPromised);

var harness = createHarness();

setAsap(function asap() {
  var groupOutput = harness.run(argv);
  var processOutput = tap(groupOutput);
  if (!argv.tap) {
    processOutput = processOutput.pipe(tapSpec());
  }
  var hasError = false;
  groupOutput.on('data', function onData(info) {
    if (!info.success) {
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

