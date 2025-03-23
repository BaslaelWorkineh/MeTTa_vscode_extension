const vscode = require('vscode');

function lintMettaCode(document) {
    const diagnostics = [];
    const text = document.getText();
    const lines = text.split('\n');
    const bracketStack = [];
    const bracketLineStack = [];

    lines.forEach((line, lineIndex) => {
        // Check for unclosed brackets
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
            const char = line[charIndex];
            if (char === '(') {
                bracketStack.push(char);
                bracketLineStack.push(lineIndex);
            } else if (char === ')') {
                if (bracketStack.length > 0) {
                    bracketStack.pop();
                    bracketLineStack.pop();
                } else {
                    // Found a closing bracket with no matching opening bracket
                    const range = new vscode.Range(lineIndex, charIndex, lineIndex, charIndex + 1);
                    const diagnostic = new vscode.Diagnostic(range, 'Unmatched closing bracket', vscode.DiagnosticSeverity.Error);
                    diagnostics.push(diagnostic);
                }
            }
        }
    });

    // Any remaining unmatched opening brackets
    while (bracketStack.length > 0) {
        const lineIndex = bracketLineStack.pop();
        const range = new vscode.Range(lineIndex, lines[lineIndex].length, lineIndex, lines[lineIndex].length);
        const diagnostic = new vscode.Diagnostic(range, 'Unmatched opening bracket', vscode.DiagnosticSeverity.Error);
        diagnostics.push(diagnostic);
        bracketStack.pop();
    }

    return diagnostics;
}

function activate(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('metta');

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === 'metta') {
                diagnosticCollection.set(document.uri, lintMettaCode(document));
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.languageId === 'metta') {
                diagnosticCollection.set(event.document.uri, lintMettaCode(event.document));
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((document) => {
            if (document.languageId === 'metta') {
                diagnosticCollection.delete(document.uri);
            }
        })
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
