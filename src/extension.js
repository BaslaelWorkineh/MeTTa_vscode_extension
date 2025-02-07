const vscode = require('vscode');
const hoverProvider = require('./hoverProvider');
const refactor = require('./refactor');
const linter = require('./linter');
const MettaFoldingRangeProvider = require('./MettaFoldingRangeProvider');
const { formatMettaCode } = require('./formatter'); // Import the formatter

let previousTheme = null;

function activate(context) {
    console.log('Activating MeTTa extension');

    function applyThemeForLanguage() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        const languageId = activeEditor.document.languageId;
        let themeToApply = null;

        switch (languageId) {
            case 'metta':
                themeToApply = 'Metta Theme';
                break;
            default:
                themeToApply = 'Default Dark+'
                break;
        }

        if (themeToApply) {
            // Get the current theme
            previousTheme = vscode.workspace.getConfiguration().get('workbench.colorTheme');

            // Apply the new theme
            vscode.workspace.getConfiguration().update('workbench.colorTheme', themeToApply, vscode.ConfigurationTarget.Workspace);
        }
    }

    // Apply the theme when the extension is activated
    applyThemeForLanguage();

    // Listen for changes to the active text editor
    vscode.window.onDidChangeActiveTextEditor(applyThemeForLanguage);

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

     // Register the formatter but initially deactivated
     let formatterEnabled = false; // Initially disabled
    context.subscriptions.push(
        vscode.commands.registerCommand('metta.enableFormatter', () => {
            formatterEnabled = true;
            vscode.window.showInformationMessage('MeTTa formatter enabled.');
        })
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand('metta.disableFormatter', () => {
            formatterEnabled = false;
            vscode.window.showInformationMessage('MeTTa formatter disabled.');
        })
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('metta', {
            provideDocumentFormattingEdits(document) {
                if (formatterEnabled) {
                    const formattedText = formatMettaCode(document.getText());
                    return [vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), formattedText)];
                } else {
                    return []; // Don't format if disabled
                }
            }
        })
    );

    // Format on save (Conditionally)
    vscode.workspace.onWillSaveTextDocument((event) => {
        const document = event.document;
        if (document.languageId === 'metta' && formatterEnabled) {
            const formattedText = formatMettaCode(document.getText());
            const edit = vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), formattedText);
            event.waitUntil(Promise.resolve([edit]));
        }
    });
}

function deactivate(context) {
    console.log('Deactivating MeTTa extension');

    // Restore the previous theme
    if (previousTheme) {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', previousTheme, vscode.ConfigurationTarget.Workspace);
    }
}

module.exports = {
    activate,
    deactivate
};