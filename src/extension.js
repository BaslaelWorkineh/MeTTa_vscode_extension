const vscode = require('vscode');
const { formatMettaCode } = require('./formatter');

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('metta', {
            provideDocumentFormattingEdits(document) {
                const formattedText = formatMettaCode(document.getText());
                return [vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), formattedText)];
            }
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
