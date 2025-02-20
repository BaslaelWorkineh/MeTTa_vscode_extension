// Cache for commonly used strings and regex patterns
const PATTERNS = {
    spaceAfterParen: /(\S)\(/g,
    spaceAfterEquals: /=\s*(?!\=)/g,
    spaceAfterArrow: /->(?=\S)/g
};

// Memoization cache for formatted lines
const memoizedResults = new Map();
const MAX_CACHE_SIZE = 1000; // Adjust based on your needs

function formatMettaCode(text) {
    // Check cache first
    const cacheKey = text.trim();
    if (memoizedResults.has(cacheKey)) {
        return memoizedResults.get(cacheKey);
    }

    const lines = text.split('\n');
    const formattedLines = [];
    let indentLevel = 0;
    let previousLineEmpty = false;

    // Pre-calculate indent spaces
    const indentSpaces = new Array(10).fill(null)
        .map((_, i) => ' '.repeat(i * 4));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let trimmedLine = line.trim();

        // Handle empty lines more efficiently
        if (!trimmedLine) {
            if (!previousLineEmpty) {
                formattedLines.push('');
                previousLineEmpty = true;
            }
            continue;
        }
        previousLineEmpty = false;

        // Process line content
        const { formattedContent, indentChange } = processLine(trimmedLine);
        
        // Update indent level
        indentLevel = Math.max(0, indentLevel + indentChange);
        
        // Get indent spaces from pre-calculated array or calculate if needed
        const currentIndent = indentLevel < 10 
            ? indentSpaces[indentLevel]
            : ' '.repeat(indentLevel * 4);

        formattedLines.push(currentIndent + formattedContent);
    }

    const result = formattedLines.join('\n');

    // Cache the result with size management
    if (memoizedResults.size >= MAX_CACHE_SIZE) {
        const firstKey = memoizedResults.keys().next().value;
        memoizedResults.delete(firstKey);
    }
    memoizedResults.set(cacheKey, result);

    return result;
}

function processLine(trimmedLine) {
    let indentChange = 0;
    
    // Split the line into code and comment parts
    let beforeComment = trimmedLine;
    let comment = '';
    let inString = false;
    let commentStart = -1;

    // Find the actual comment start (ignoring semicolons in strings)
    for (let i = 0; i < trimmedLine.length; i++) {
        const char = trimmedLine[i];
        if (char === '"' && trimmedLine[i - 1] !== '\\') {
            inString = !inString;
        } else if (char === ';' && !inString) {
            commentStart = i;
            break;
        }
    }

    if (commentStart !== -1) {
        beforeComment = trimmedLine.slice(0, commentStart).trim();
        comment = trimmedLine.slice(commentStart);
    }

    // Count brackets only in the code part (before comment)
    let openCount = 0;
    let closeCount = 0;
    inString = false;

    for (let i = 0; i < beforeComment.length; i++) {
        const char = beforeComment[i];
        if (char === '"' && beforeComment[i - 1] !== '\\') {
            inString = !inString;
        } else if (!inString) {
            if (char === '(') openCount++;
            else if (char === ')') closeCount++;
        }
    }

    indentChange = openCount - closeCount;

    // Apply formatting patterns only to the code part
    if (beforeComment.includes('(')) {
        beforeComment = beforeComment.replace(PATTERNS.spaceAfterParen, '$1 (');
    }
    if (beforeComment.includes('=')) {
        beforeComment = beforeComment.replace(PATTERNS.spaceAfterEquals, '= ');
    }
    if (beforeComment.includes('->')) {
        beforeComment = beforeComment.replace(PATTERNS.spaceAfterArrow, '-> ');
    }

    return {
        formattedContent: beforeComment + (comment ? ' ' + comment.trim() : ''),
        indentChange
    };
}

// Optional: Periodic cache cleanup
setInterval(() => {
    if (memoizedResults.size > MAX_CACHE_SIZE / 2) {
        const keysToDelete = Array.from(memoizedResults.keys())
            .slice(0, Math.floor(MAX_CACHE_SIZE / 4));
        keysToDelete.forEach(key => memoizedResults.delete(key));
    }
}, 60000); // Clean up every minute

module.exports = {
    formatMettaCode,
    // Expose for testing
    clearCache: () => memoizedResults.clear()
};