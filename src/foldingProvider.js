const vscode = require('vscode');

class MettaFoldingRangeProvider {
    provideFoldingRanges(document, context, token) {
        const foldingRanges = [];
        const lines = document.getText().split('\n');
        const stack = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('(')) {
                stack.push(i);
            }

            if (trimmedLine.includes('=') && stack.length > 0) {
                const startLine = stack.pop();
                if (startLine !== i) {
                    foldingRanges.push(new vscode.FoldingRange(startLine, i));
                }
            }

            if (trimmedLine.includes(')') && stack.length > 0) {
                const startLine = stack.pop();
                if (startLine !== i) {
                    foldingRanges.push(new vscode.FoldingRange(startLine, i));
                }
            }
        }

        return foldingRanges;
    }
}

module.exports = MettaFoldingRangeProvider;
