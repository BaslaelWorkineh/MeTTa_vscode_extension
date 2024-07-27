const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('metta.refactor', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return; // No open text editor
            }

            const document = editor.document;
            const selection = editor.selection;

            if (selection.isEmpty) {
                vscode.window.showInformationMessage('Please select a variable or function name to refactor.');
                return;
            }

            // Get the selected text
            const selectedText = document.getText(selection);
            const newName = await vscode.window.showInputBox({
                prompt: 'Enter the new name',
                value: selectedText
            });

            if (!newName) {
                return; // No new name provided
            }

            // Replace all occurrences of the selected text with the new name
            const edit = new vscode.WorkspaceEdit();
            const text = document.getText();
            const regex = new RegExp(`\\b${selectedText}\\b`, 'g');
            let match;

            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + selectedText.length);
                edit.replace(document.uri, new vscode.Range(startPos, endPos), newName);
            }

            await vscode.workspace.applyEdit(edit);
            vscode.window.showInformationMessage(`Refactored ${selectedText} to ${newName}`);
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
