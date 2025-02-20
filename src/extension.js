const vscode = require('vscode');
const hoverProvider = require('./hoverProvider');
const refactor = require('./refactor');
const linter = require('./linter');
const MettaFoldingRangeProvider = require('./MettaFoldingRangeProvider');
const { formatMettaCode } = require('./formatter');

// Debounce function to limit the frequency of operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function activate(context) {
    console.log('Activating MeTTa extension');

    let formatterEnabled = false;
    let isProcessing = false; // Lock to prevent concurrent formatting

    // Optimize comment selection command with a processing lock
    context.subscriptions.push(
        vscode.commands.registerCommand('metta.commentSelection', async () => {
            if (isProcessing) return;
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            isProcessing = true;
            try {
                const document = editor.document;
                const selection = editor.selection;
                const selectedText = document.getText(selection);
                const lines = selectedText.split('\n');
                const commentedLines = lines.map(line => ';' + line);
                const commentedText = commentedLines.join('\n');

                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, commentedText);
                });
            } finally {
                isProcessing = false;
            }
        })
    );

    // Initialize other providers
    hoverProvider.activate(context);
    refactor.activate(context);
    linter.activate(context);

    // Register folding range provider
    context.subscriptions.push(
        vscode.languages.registerFoldingRangeProvider(
            { language: 'metta' }, 
            new MettaFoldingRangeProvider()
        )
    );

    // Formatter commands
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

    // Debounced format function
    const debouncedFormat = debounce((document) => {
        if (!formatterEnabled || isProcessing) return [];
        
        try {
            isProcessing = true;
            const formattedText = formatMettaCode(document.getText());
            return [vscode.TextEdit.replace(
                new vscode.Range(0, 0, document.lineCount, 0),
                formattedText
            )];
        } finally {
            isProcessing = false;
        }
    }, 250); // 250ms debounce

    // Document formatting provider
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('metta', {
            provideDocumentFormattingEdits(document) {
                return debouncedFormat(document);
            }
        })
    );

    // Optimized format on save
    let saveTimeout;
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument((event) => {
            const document = event.document;
            if (document.languageId !== 'metta' || !formatterEnabled || isProcessing) return;

            // Clear any pending save operations
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }

            event.waitUntil(new Promise((resolve) => {
                saveTimeout = setTimeout(() => {
                    try {
                        isProcessing = true;
                        const formattedText = formatMettaCode(document.getText());
                        resolve([vscode.TextEdit.replace(
                            new vscode.Range(0, 0, document.lineCount, 0),
                            formattedText
                        )]);
                    } finally {
                        isProcessing = false;
                    }
                }, 100);
            }));
        })
    );
}

function deactivate() {
    console.log('Deactivating MeTTa extension');
}

module.exports = {
    activate,
    deactivate
};