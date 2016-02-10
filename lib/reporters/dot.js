var through = require('through');
var chalk = require('chalk');
var diff = require('variable-diff');
var INDENT = '  ';

function indentLine(line) {
  return INDENT + '    ' + line;
}

function dot(stream) {
  var output = through();
  var firstTest = true;

  function write(text) {
    output.queue(text);
  }

  function handleTest(test) {
    var text;
    if (test.success) {
      text = chalk.green('.');
    } else {
      text = chalk.red('x');
    }
    write(firstTest ? INDENT + text : text);
    firstTest = false;
  }

  function handleEnd(info) {
    var error, i, len;

    write('\n\n'  + INDENT + info.time + ' ms\n');
    write(INDENT + info.testCount + ' tests\n');
    write(INDENT + chalk.green((info.testCount - info.errors.length) + ' passed\n'));
    if (info.errors.length) {
      write(INDENT + chalk.red(info.errors.length + ' failed\n'));
      write('\n' + INDENT + chalk.red('Failed Tests:\n'));
      for (i = 0, len = info.errors.length; i < len; i++) {
        error = info.errors[i];
        write(INDENT + ' ' + chalk.red('x') + ' ' + error.name + '\n');
        write(INDENT + '   ' + error.error.message + '\n');
        if (error.error.actual && error.error.expected) {
          write(diff(error.error.actual, error.error.expected).text.split('\n').map().join('\n') + '\n');
        }
        write(error.error.stack.split('\n').map(indentLine).join('\n') + '\n');
      }
    } else {
      write('\n' + INDENT + chalk.green('Pass!\n'));
    }
  }

  var actionHanders = {
    'test.end': handleTest,
    'end': handleEnd
  };

  stream.on('data', function onData(info) {
    if (actionHanders[info.type]) {
      actionHanders[info.type](info.data);
    }
  });

  return output;
}

module.exports = dot;
