var through = require('through');
var chalk = require('chalk');
var diff = require('variable-diff');
var figures = require('figures');
var INDENT = '  ';

function indentLine(line) {
  return INDENT + '    ' + line;
}
function spec(stream) {
  var output = through();

  function write(text) {
    output.queue(text);
  }

  function handleTest(test) {
    var text;
    if (test.success) {
      text = chalk.green(figures.tick);
    } else {
      text = chalk.red(figures.cross);
    }
    write(INDENT + text + ' ' +  test.name + '\n');

    if (test.error) {
      write(INDENT + '   ' + test.error.message + '\n');
      if (test.error.actual && test.error.expected) {
        write(diff(test.error.expected, test.error.actual).text.split('\n').map(indentLine).join('\n') + '\n');
      }
      write(test.error.stack.split('\n').map(indentLine).join('\n') + '\n');
    }
  }

  function handleEnd(info) {
    write('\n\n'  + INDENT + info.time + ' ms\n');
    write(INDENT + info.testCount + ' tests\n');
    write(INDENT + chalk.green((info.testCount - info.errors.length) + ' passed\n'));
    if (info.errors.length) {
      write(INDENT + chalk.red(info.errors.length + ' failed\n'));
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

module.exports = spec;
