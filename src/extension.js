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

    // Register the comment selection command
    context.subscriptions.push(
        vscode.commands.registerCommand('metta.commentSelection', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return; // No open text editor
            }

            const document = editor.document;
            const selection = editor.selection;

            // Get the selected text
            const selectedText = document.getText(selection);

            // Split the selected text into lines
            const lines = selectedText.split('\n');

            // Add ';' to the start of each line
            const commentedLines = lines.map(line => ';' + line);

            // Join the commented lines back into a single string
            const commentedText = commentedLines.join('\n');

            editor.edit(editBuilder => {
                editBuilder.replace(selection, commentedText);
            });
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
