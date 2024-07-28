const vscode = require('vscode');

class MettaFoldingRangeProvider {
    provideFoldingRanges(document, context, token) {
        const foldingRanges = [];
        const lines = document.getText().split('\n');
        const stack = [];

        function isFoldingStart(line) {
            return line.replace(/\s+/g, '').startsWith('(=');
        }

        function countOpenParentheses(line) {
            return (line.match(/\(/g) || []).length;
        }

        function countCloseParentheses(line) {
            return (line.match(/\)/g) || []).length;
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (isFoldingStart(trimmedLine)) {
                stack.push({ startLine: i, openParentheses: countOpenParentheses(trimmedLine) - countCloseParentheses(trimmedLine) });
            } else if (stack.length > 0) {
                stack[stack.length - 1].openParentheses += countOpenParentheses(trimmedLine) - countCloseParentheses(trimmedLine);
            }

            while (stack.length > 0 && stack[stack.length - 1].openParentheses <= 0) {
                const { startLine } = stack.pop();
                if (startLine !== i) {
                    foldingRanges.push(new vscode.FoldingRange(startLine, i));
                }
            }
        }

        return foldingRanges;
    }
}

module.exports = MettaFoldingRangeProvider;
