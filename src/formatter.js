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
        if (commentIndex !== -1) {
            let beforeComment = trimmedLine.slice(0, commentIndex).trim();
            let comment = trimmedLine.slice(commentIndex).trim();
            trimmedLine = beforeComment + ' ' + comment; // Preserve the comment text
        }

        trimmedLine = trimmedLine.replace(/\s+/g, ' ');

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
