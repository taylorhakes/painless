'use strict';

var through = require('through');
var diff = require('variable-diff');

function createResult() {
  var count = 0;
  var pass = 0;
  var fail = 0;
  var start = Date.now();
  var result = through();

  function encodeResult(res) {
    var output = '';
    var outer;
    var inner;
    var lines;
    var i;
    var hasInfo = false;

    count++;
    output += (res.success ? 'ok ' : 'not ok ') + count;
    output += res.name ? ' ' + res.name.toString().replace(/\s+/g, ' ') : '';

    output += '\n';

    if (res.success) {
      pass++;
      result.queue(output);
      return;
    }

    outer = '  ';
    inner = outer + '  ';
    output += outer + '---\n';

    if (res.error) {
      output += inner + 'error: |-\n';
      inner += '  ';
      if (res.error.message) {
        output += inner + res.error.message + '\n';
      }
      if (res.actual && res.expected) {
        hasInfo = true;
        output += inner + 'Diff:\n';
        lines = diff(res.expected, res.actual).text.split('\n');
        for (i = 0; i < lines.length; i++) {
          output += inner + '  ' + lines[i] + '\n';
        }
      }
      if (res.error.stack) {
        lines = String(res.error.stack).split('\n');
        if (!hasInfo) {
          output += inner + lines[0] + '\n';
        }
        output += inner + 'Stack:\n';
        for (i = 1; i < lines.length; i++) {
          if (lines[i].indexOf('(domain.js') > -1) {
            break;
          }
          output += inner + lines[i] + '\n';
        }
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
    write('# time ' + (Date.now() - start) + 'ms\n');
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
