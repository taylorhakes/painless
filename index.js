var setAsap = require('setasap');
var tap = require('./lib/reporters/tap');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var tapSpec = require('tap-spec');
var createHarness = require('./lib/create-harness');

chai.use(chaiAsPromised);

var harness = createHarness();

setAsap(function asap() {
  var groupOutput = harness.run();
  var processOutput = tap(groupOutput).pipe(tapSpec());
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
  process.on('exit', function onExit(code) {
    if (code || !hasError) {
      return;
    }

    process.exit(1);
  });
});

module.exports.createGroup = harness.createGroup;
module.exports.assert = chai.assert;
module.exports.spy = sinon.spy;
module.exports.stub = sinon.stub;
module.exports.mock = sinon.mock;
module.exports.sinon = sinon;

