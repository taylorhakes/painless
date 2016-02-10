var chalk = require('chalk');
var diff = require('variable-diff');
var helper = require('painless-reporter-helper');
var INDENT = '  ';

function indentLine(line) {
  return INDENT + '    ' + line;
}

function handleTest() {
  var firstTest = true;

  return function onTest(test) {
    var text;
    var isFirst = firstTest;

    if (test.success) {
      text = chalk.green('.');
    } else {
      text = chalk.red('x');
    }
    firstTest = false;
    return isFirst ? INDENT + text : text;
  };
}

function handleEnd(info) {
  var error, i, len, output = [];
  function push(text) {
    output.push(text);
  }

  push('\n\n'  + INDENT + info.time + ' ms\n');
  push(INDENT + info.testCount + ' tests\n');
  push(INDENT + chalk.green(info.testCount - info.errors.length + ' passed\n'));

  if (info.errors.length) {
    push(INDENT + chalk.red(info.errors.length + ' failed\n'));
    push('\n' + INDENT + chalk.red('Failed Tests:\n'));
    for (i = 0, len = info.errors.length; i < len; i++) {
      error = info.errors[i];
      push(INDENT + ' ' + chalk.red('x') + ' ' + error.name + '\n');
      push(INDENT + '   ' + error.error.message + '\n');
      if (error.error.actual && error.error.expected) {
        push(diff(error.error.expected, error.error.actual).text.split('\n').map(indentLine).join('\n') + '\n');
      }
      push(error.error.stack.split('\n').map(indentLine).join('\n') + '\n');
    }
  } else {
    push('\n' + INDENT + chalk.green('Pass!\n'));
  }
  return output.join('');
}

module.exports = helper({
  'test.end': handleTest(),
  'end': handleEnd
});
