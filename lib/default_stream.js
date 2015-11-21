var through = require('through');
var fs = require('fs');

function defaultStream() {
  var line = '';

  function write(buf) {
    var c;
    for (var i = 0; i < buf.length; i++) {
      c = typeof buf === 'string'
        ? buf.charAt(i)
        : String.fromCharCode(buf[i]);

      if (c === '\n') {
        flush();
      } else {
        line += c;
      }
    }
  }

  function flush() {
    if (fs.writeSync && /^win/.test(process.platform)) {
      try {
        fs.writeSync(1, line + '\n');
      } catch (e) {
        stream.emit('error', e);
      }
    }
    else {
      try {
        console.log(line)
      } catch (e) {
        stream.emit('error', e)
      }
    }
    line = '';
  }

  return through(write, flush);
}

module.exports = defaultStream;
