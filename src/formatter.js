function formatMettaCode(text) {
    const lines = text.split('\n');
    let formattedLines = [];
    let indentLevel = 0;
    let inTopLevelExpression = false;
    let bracketStack = [];
    let previousLineEmpty = false;

    lines.forEach((line) => {
        let trimmedLine = line.trim();

        if (trimmedLine === "") {
            if (!previousLineEmpty) {
                formattedLines.push('');
                previousLineEmpty = true;
            }
            return;
        } else {
            previousLineEmpty = false;
        }

        let commentIndex = trimmedLine.indexOf(';');
        let beforeComment = trimmedLine;
        let comment = '';
        if (commentIndex !== -1) {
            beforeComment = trimmedLine.slice(0, commentIndex).trim();
            comment = ' ' + trimmedLine.slice(commentIndex).trim(); // Preserve the comment text
        }

        // Ensure space after '(='
        beforeComment = beforeComment.replace(/\(\s*=\s*/g, '(= ');

        // Ensure space after '->' if followed by a word without space
        beforeComment = beforeComment.replace(/->(?=\S)/g, '-> ');

        trimmedLine = beforeComment + comment;

        formattedLines.push(' '.repeat(indentLevel * 4) + trimmedLine);

        for (let char of trimmedLine) {
            if (char === '(') {
                bracketStack.push('(');
                indentLevel++;
                inTopLevelExpression = true;
            } else if (char === ')') {
                if (bracketStack.length > 0) {
                    bracketStack.pop();
                    indentLevel = Math.max(indentLevel - 1, 0);
                }
            }
        }

        if (bracketStack.length === 0 && inTopLevelExpression) {
            inTopLevelExpression = false;
        }
    });

    return formattedLines.join('\n');
}

module.exports = {
    formatMettaCode
};
