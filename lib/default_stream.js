var through = require('through');
var fs = require('fs');
var log;
var writeSync;
var platform;
var fromCharCode;

require('polyfill-function-prototype-bind');

// Save globals so tests don't affect them
log = console.log.bind(console); // eslint-disable-line no-console
writeSync = fs.writeSync && fs.writeSync.bind(fs);
platform = process ? process.platform : '';
fromCharCode = String.fromCharCode;

function defaultStream() {
  var line = '';
  var stream;

  function flush() {
    if (writeSync && /^win/.test(platform)) {
      try {
        writeSync(1, line + '\n');
      } catch (e) {
        stream.emit('error', e);
      }
    } else {
      try {
        log(line);
      } catch (e) {
        stream.emit('error', e);
      }
    }
    line = '';
  }

  function write(buf) {
    var c;
    var i;
    for (i = 0; i < buf.length; i++) {
      c = typeof buf === 'string'
        ? buf.charAt(i)
        : fromCharCode(buf[i]);

      if (c === '\n') {
        flush();
      } else {
        line += c;
      }
    }
  }

  stream = through(write, flush);
  return stream;
}

module.exports = defaultStream;
