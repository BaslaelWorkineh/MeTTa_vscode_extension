const vscode = require('vscode');
const { format } = require('./formatter');

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('metta', {
      provideDocumentFormattingEdits(document) {
        const text = document.getText();
        const formatted = format(text);
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );
        return [vscode.TextEdit.replace(fullRange, formatted)];
      },
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
