const vscode = require('vscode');
const { formatMettaCode } = require('./formatter');
const hoverProvider = require('./hoverProvider');
const refactor = require('./refactor');
const linter = require('./linter');
const MettaFoldingRangeProvider = require('./MettaFoldingRangeProvider');

function activate(context) {
    console.log('Activating MeTTa extension');

    vscode.workspace.getConfiguration().update('workbench.colorTheme', 'Metta Theme', true);

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
                return;
            }

            const document = editor.document;
            const selection = editor.selection;
            const selectedText = document.getText(selection);
            const lines = selectedText.split('\n');
            const commentedLines = lines.map(line => ';' + line);
            const commentedText = commentedLines.join('\n');

            editor.edit(editBuilder => {
                editBuilder.replace(selection, commentedText);
            });
        })
    );

    hoverProvider.activate(context);
    refactor.activate(context);
    linter.activate(context);


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
