const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('metta', {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (range) {
                    const word = document.getText(range);
                    const hoverMessage = getHoverMessage(word);
                    return new vscode.Hover(hoverMessage);
                }
                return undefined;
            }
        })
    );
}

function getHoverMessage(word) {
    const hoverMessages = {
        'if': 'The `if` keyword is used for conditional statements.',
        'else': 'The `else` keyword is used to define an alternative block of code that runs if the `if` condition is false.',
        'case': 'The `case` keyword is used in switch statements to define different branches.',
        'then': 'The `then` keyword is used to define the block of code that follows a condition.',
        'while': 'The `while` keyword is used to define a loop that continues as long as the condition is true.',
        'for': 'The `for` keyword is used to define a loop with a specified number of iterations.',
        'def': 'The `def` keyword is used to define a new function.',
        'return': 'The `return` keyword is used to return a value from a function.',
        'and': 'The `and` keyword is used to combine multiple conditions in logical expressions.',
        'or': 'The `or` keyword is used to define an alternative condition in logical expressions.'
    };
    
    return hoverMessages[word] || `No hover information available for ${word}`;
}

module.exports = {
    activate
};
