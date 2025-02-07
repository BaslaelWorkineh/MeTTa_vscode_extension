function formatMettaCode(text) {
    const lines = text.split('\n');
    let formattedLines = [];
    let indentLevel = 0;
    let bracketStack = [];
    let previousLineEmpty = false;

    lines.forEach((line) => {
        let trimmedLine = line.trim();

        // Handle empty lines
        if (trimmedLine === "") {
            if (!previousLineEmpty) {
                formattedLines.push('');
                previousLineEmpty = true;
            }
            return;
        } else {
            previousLineEmpty = false;
        }
console.log("hello world")
        // Separate comments from the rest of the line
        let commentIndex = trimmedLine.indexOf(';');
        let beforeComment = trimmedLine;
        let comment = '';
        if (commentIndex !== -1) {
            beforeComment = trimmedLine.slice(0, commentIndex).trim();
            comment = ' ' + trimmedLine.slice(commentIndex).trim(); // Preserve the comment text
        }

        // Ensure space after '(' only when it is not the first character in the line
        beforeComment = beforeComment.replace(/(\S)\(/g, '$1 (');

        // Ensure space after '=' if not followed by another '=' and remove any extra spaces
        beforeComment = beforeComment.replace(/=\s*(?!\=)/g, '= ');

        // Ensure space after '->' if followed by a word without space
        beforeComment = beforeComment.replace(/->(?=\S)/g, '-> ');

        trimmedLine = beforeComment + comment;

        // Adjust the indentation level based on the bracket stack before adding the line
        if (beforeComment.startsWith(')')) {
            indentLevel = Math.max(indentLevel - 1, 0);
        }

        // Add the line with proper indentation
        formattedLines.push(' '.repeat(indentLevel * 4) + trimmedLine);

        // Update the bracket stack and indentation level
        for (let char of beforeComment) {
            if (char === '(') {
                bracketStack.push('(');
                indentLevel++;
            } else if (char === ')') {
                if (bracketStack.length > 0) {
                    bracketStack.pop();
                    indentLevel = Math.max(indentLevel - 1, 0);
                }
            }
        }
    });

    return formattedLines.join('\n');
}

module.exports = {
    formatMettaCode
};