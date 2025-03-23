const vscode = require("vscode");

class MettaDefinitionProvider {
    provideDefinition(document, position, token) {
        // Get the word at the current cursor position
        const wordRange = document.getWordRangeAtPosition(position, /\w+/);
        if (!wordRange) return null;

        const word = document.getText(wordRange);
        console.log(`Searching for definition of: ${word}`);  // Debugging line

        // To get all the files in the folder
        return vscode.workspace.findFiles("**/*.metta").then(files => {
            let functionDefinitionLocation = null;

            // Iterate through all files
            const promises = files.map(file => {
                return vscode.workspace.openTextDocument(file).then(doc => {
                    const text = doc.getText();
                    
                    // Define how to find the function expression
                    const functionPattern = new RegExp(`\\(\\s*=\\s*\\(${word}\\s*`, "g");
                    let match;
                    
                    // Searching with in the file for the function definition
                    while ((match = functionPattern.exec(text)) !== null) {
                        const lineNumber = doc.positionAt(match.index).line;
                        console.log(`Found function definition at line: ${lineNumber} in file: ${file.path}`);  // Debugging line
                        
                        functionDefinitionLocation = new vscode.Location(
                            doc.uri,
                            new vscode.Position(lineNumber, 0)
                        );
                        return functionDefinitionLocation;  // To return location when found
                    }

                    // When no function definition is found in this fill, return null
                    return null;
                });
            });

            // Wait for all the promises to complete and return the first result
            return Promise.all(promises).then(results => {
                functionDefinitionLocation = results.find(location => location !== null);
                
                if (functionDefinitionLocation) {
                    console.log(`Returning function definition location: ${functionDefinitionLocation}`);  // Debugging line
                    return functionDefinitionLocation;
                }

                console.log(`No function definition found for: ${word}`);  // Debugging line
                return null;  // No function definition found
            });
        });
    }
}

module.exports = MettaDefinitionProvider;
 