const vscode = require('vscode');
const { formatMettaCode } = require('./formatter');
const hoverProvider = require('./hoverProvider');
const refactor = require('./refactor');
const linter = require('./linter');
const MettaFoldingRangeProvider = require('./MettaFoldingRangeProvider');

function activate(context) {
    console.log('Activating MeTTa extension');

    // Set custom theme
    vscode.workspace.getConfiguration().update('workbench.colorTheme', 'Metta Theme', true);

    // Register the formatting provider
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

    // Activate hover provider
    hoverProvider.activate(context);

    // Activate refactor command
    refactor.activate(context);

    // Activate linter
    linter.activate(context);

    // Activate folding provider
    console.log('Registering folding range provider');
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider({ language: 'metta' }, new MettaFoldingRangeProvider())
    );

    // Format on save
    vscode.workspace.onWillSaveTextDocument((event) => {
        const document = event.document;
        if (document.languageId === 'metta') {
            const formattedText = formatMettaCode(document.getText());
            const edit = vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), formattedText);
            event.waitUntil(Promise.resolve([edit]));
        }
    });
}

function deactivate() {
    console.log('Deactivating MeTTa extension');
}

module.exports = {
    activate,
    deactivate
};
