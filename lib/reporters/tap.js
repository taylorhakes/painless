'use strict';

var through = require('through');
var diff = require('variable-diff');

function createResult() {
  var count = 0;
  var pass = 0;
  var fail = 0;
  var time;
  var result = through();

  function encodeResult(info) {
    if (info.type === 'end') {
      time = info.data.time;
      return;
    }

    if (info.type !== 'test.end') {
      return;
    }


    var res = info.data;
    var output = '';
    var outer;
    var inner;
    var lines;
    var i;

    count++;
    output += (res.success ? 'ok ' : 'not ok ') + count;
    output += ' ' + res.name.toString().replace(/\s+/g, ' ');

    output += '\n';

    if (res.success) {
      pass++;
      result.queue(output);
      return;
    }

    outer = '  ';
    inner = outer + '  ';
    output += outer + '---\n';

    output += inner + 'error: |-\n';
    inner += '  ';
    output += inner + res.error.message + '\n';
    if (res.actual && res.expected) {
      output += inner + 'Diff:\n';
      lines = diff(res.expected, res.actual).text.split('\n');
      for (i = 0; i < lines.length; i++) {
        output += inner + '  ' + lines[i] + '\n';
      }
    }
    if (res.error.stack) {
      lines = String(res.error.stack).split('\n');
      output += inner + 'Stack:\n';
      for (i = 1; i < lines.length; i++) {
        if (lines[i].indexOf('(domain.js') > -1) {
          break;
        }
        output += inner + lines[i] + '\n';
      }
    }

    output += outer + '...\n';

    fail++;
    result.queue(output);
  }

  function close() {
    function write(s) {
      result.queue(s);
    }

    write('\n1..' + count + '\n');
    write('# tests ' + count + '\n');
    write('# pass  ' + pass + '\n');
    if (fail) {
      write('# fail  ' + fail + '\n');
    } else {
      write('\n# ok\n');
    }
    write('# time ' + time + 'ms\n');
    write('# ' + (fail > 0 ? 'failed' : 'passed') + '!\n');
    write(null);
  }

  return {
    encodeResult: encodeResult,
    close: close,
    output: result
  };
}

function report(stream) {
  var result = createResult();
  stream.on('data', result.encodeResult);
  stream.on('end', result.close);
  return result.output;
}

module.exports = report;
