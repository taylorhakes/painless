var through = require('through');

function json(stream) {
  var output = through();

  stream.on('data', function onData(data) {
    output.queue(JSON.stringify(data));
  });

  stream.on('end', function onEnd() {
    output.queue(null);
  });

  return output;
}

module.exports = json;
