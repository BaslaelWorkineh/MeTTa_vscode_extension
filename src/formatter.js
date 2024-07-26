function format(text) {
  const indent = '  ';
  let formatted = '';
  let indentLevel = 0;

  text.split('\n').forEach(line => {
    line = line.trim();

    if (line.startsWith(')')) {
      indentLevel--;
    }

    formatted += indent.repeat(indentLevel) + line + '\n';

    if (line.endsWith('(')) {
      indentLevel++;
    }
  });

  return formatted;
}

module.exports = { format };
