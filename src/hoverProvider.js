const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('metta', {
            provideHover(document, position, token) {
                const range = getWordRangeAtPosition(document, position);
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

function getWordRangeAtPosition(document, position) {
    let start = position;
    let end = position;

    while (start.character > 0 && /[\w-!&*$_=<>+*/-]/.test(document.getText(new vscode.Range(start.translate(0, -1), start)))) {
        start = start.translate(0, -1);
    }

    while (/[\w-!&*$_=<>+*/-]/.test(document.getText(new vscode.Range(end, end.translate(0, 1))))) {
        end = end.translate(0, 1);
    }

    return new vscode.Range(start, end);
}

function getHoverMessage(word) {
    const hoverMessages = {
        'if': 'The `if` keyword is used for conditional statements.`if` works much like if-then-else construction in any other language.',
        'case': 'Another conditional statement in MeTTa is case, which pattern-matches the given atom against a number of patterns sequentially in a mutually exclusive way',
        'and': 'The `and` keyword is used to combine multiple conditions in logical expressions.',
        'or': 'The `or` keyword is used to define an alternative condition in logical expressions.',
        'match': 'The `match` function is used for pattern matching. It expects three arguments: a grounded atom referencing a Space, a pattern atom to be matched, and an output pattern typically containing variables from the input pattern. `&self` is a reference to the current program Space.',
        'println!': 'The `println!` function is used to print a line of text to the console. Its type signature is `(-> %Undefined% (->))`. The function accepts only a single argument, but multiple values can be printed by enclosing them within parentheses to form a single atom:',
        'trace!': '`trace!` accepts two arguments, the first is the atom to print, and the second is the atom to return. Both are evaluated before passing to trace!, which type is (-> %Undefined% $a $a), meaning that the reduced type of the whole trace! expression is the same as the reduced type of the second argument:',
        'assertEqualToResult': '`assertEqualToResult` has the same type as `assertEqual`, namely `(-> Atom Atom Atom)`, and it evaluates the first expression. However, it doesn\'t evaluate the second expression, but considers it a set of expected results of the first expression.',
        'car-atom': '`car-atom` and `cdr-atom` are typically used for recursive traversal of an expression. One basic example is creation of lists from tuples.',
        'collapse': '`collapse` is a grounded function, which runs the interpreter on the given atom and wraps the returned results into an expression. Reverse operation to `superpose` is `collapse`, which has the type `(-> Atom Expression)`. It converts a nondeterministic result into a tuple. `collapse` is a grounded function, which runs the interpreter on the given atom and wraps the returned results into an expression.',
        'superpose': 'If you need to get a nondeterministic result explicitly, use the `superpose` function, which turns a tuple into a nondeterministic result. It is an stdlib function of `(-> Expression Atom)` type.',
        'bind!': '`bind!` registers a new token which is replaced with an atom during the parsing of the rest of the program. Its type is `(-> Symbol %Undefined% (->))`',
        'import!': 'Stdlib has operations for importing scripts and modules. One such operation is `import!`. It accepts two arguments. The first argument is a symbol, which is turned into the token for accessing the imported module. The second argument is the module name. ',
        'add-reduct': 'Unable to find the definition for `add-reduct` in the documentation',
        'remove-atom': 'The function `remove-atom` removes an atom from the AtomSpace without reducing it. Its type is `(-> hyperon::space::DynSpace Atom (->))`.',
        'cdr-atom': '`car-atom` and `cdr-atom` are typically used for recursive traversal of an expression. One basic example is creation of lists from tuples.',
        'cons-atom': '`cons-atom` is a function, which constructs an expression using two arguments, the first of which serves as a head and the second serves as a tail.`cons-atom` reverses the results of `car-atom` and `cdr-atom`',
        'new-space': 'It is possible to create other spaces with the use of `new-space` function from stdlib. Its type is `(-> hyperon::space::DynSpace)`, so it has no arguments and returns a fresh space. Creating new spaces can be useful to keep the program space cleaner, or to simplify queries.',
        'assertEqual': '`assertEqual` compares (sets of) results of evaluation of two expressions. Its type is (-> Atom Atom Atom), so it interprets expressions internally and can compare erroneous expressions. If sets of results are equal, it outputs the unit value ().',
        'add-atom': 'The function `add-atom` adds an atom into the Space. Its type is `(-> hyperon::space::DynSpace Atom (->))`',
        'get-type': 'One can check the type of an atom with `get-type` function from stdlib.',
        'get-metatype': 'One can use `get-metatype` to retrieve the metatype of an atom',
        'unify': 'Function `unify` accepts two patterns to be unified (matched together in such the way that shared variables in them get most general non-contradictory substitutions).',
        'Nil': 'The `Nil` word represents an empty list or null value.',
        'True': 'The `True` keyword represents a boolean true value.',
        'False': 'The `False` keyword represents a boolean false value.',
        'Bool': 'The `Bool` keyword represents the boolean type.',
        'Number': 'The `Number` keyword represents the number type.',
        '$_': 'The `$_` wildcard is used to represent any value in pattern matching.',
        '&self': '`&self` is a reference to the current program Space',
        'empty': 'Since expressions without suitable equalities remain unreduced in MeTTa, `(empty)` can be used to alter this behavior.',
        'mod-space!': '`mod-space!` returns the space of the module (and tries to load the module if it is not loaded into the module system). Thus, we can explore the module space explicitly.',
        'let': 'The `let` function is utilized to establish temporary variable bindings within an expression. It allows introducing variables, assign values to them, and then use these values within the scope of the let block.',
        'let*': 'When several consecutive substitutions are required, `let*` can be used for convenience. The first argument of `let*` is Expression, which elements are the required substitutions, while the second argument is the resulting expression',
        'pragma!': '`(pragma! type-check auto)` can be used to enable automatic detection of such errors:',
        'quote': 'Another very simple constructor from stdlib is `quote`, which is defined just as `(: quote (-> Atom Atom))`. It does nothing except of wrapping its argument and preventing it from being evaluated.',
        'not' : 'A grounded function that has `(-> Bool Bool)` type',
        'Error' :"`Error` is not a grounded atom, it is just a symbol. It doesn't even have defined equalities, so it works just an expression constructor, which prevents its arguments from being evaluated and which has a return type, which can be used to catch errors. `Error` expects the arguments of `Atom` type:",
        'Atom' : 'Atom is a supertype for Symbol, Expression, Variable, Grounded.',
        'new-space': 'Creates a new space. Used in `metta_state` and `metta_atoms`.',
        'new-state': 'Creates a new state. Used in `metta_state`, `query_state_x10`, and `query_state_x50`.',
        'change-state!': 'Changes the state of an atom. Used in `change_state_x10` and `change_state_x50`.',
        'get-state': 'Retrieves the state of an atom. Used in `change_state_x10` and `change_state_x50`.',
        "get-type-space": "Retrieves the type space. Registered with `GetTypeSpaceOp`.",
        "min-atom": "Finds the minimum atom. Registered with `MinAtomOp`.",
        "max-atom": "Finds the maximum atom. Registered with `MaxAtomOp`.",
        "size-atom": "Gets the size of an atom. Registered with `SizeAtomOp`.",
        "index-atom": "Gets the index of an atom. Registered with `IndexAtomOp`.",
        "unique-atom": "Gets the unique atoms. Registered with `UniqueAtomOp`.",
        "subtraction-atom": "Performs atom subtraction. Registered with `SubtractionAtomOp`.",
        "intersection-atom": "Performs atom intersection. Registered with `IntersectionAtomOp`.",
        "union-atom": "Performs atom union. Registered with `UnionAtomOp`.",
        "assertEqual": "Asserts that two atoms have the same evaluation result.",
        "assertAlphaEqual": "Asserts that two atoms have alpha-equivalent evaluation results.",
        "assertEqualToResult": "Asserts that an atom's evaluation result matches a given expression.",
        "assertAlphaEqualToResult": "Asserts that an atom's evaluation result is alpha-equivalent to a given expression.",
        "=alpha": "Checks if two atoms are alpha-equivalent.",
        "pow-math": "Represents the power function.",
        "sqrt-math": "Represents the square root function.",
        "abs-math": "Represents the absolute value function.",
        "log-math": "Represents the logarithm function.",
        "trunc-math": "Represents the truncation function.",
        "ceil-math": "Represents the ceiling function.",
        "floor-math": "Represents the floor function.",
        "round-math": "Represents the rounding function.",
        "sin-math": "Represents the sine function.",
        "asin-math": "Represents the arcsine function.",
        "cos-math": "Represents the cosine function.",
        "acos-math": "Represents the arccosine function.",
        "tan-math": "Represents the tangent function.",
        "atan-math": "Represents the arctangent function.",
        "isnan-math": "Represents the \"is NaN\" (Not a Number) function.",
        "isinf-math": "Represents the \"is infinite\" function.",
        "PI": "Represents the mathematical constant Pi.",
        "EXP": "Represents the mathematical constant E (Euler's number).",
        "mod-space!": "Returns the space of a specified module.",
        "print-mods!": "Prints the loaded modules.",
        "register-module!": "Registers a module from a file system path.",
        "git-module!": "Registers a module from a remote git repository.",
        "random-int": "Generates a random integer within a given range.",
        "random-float": "Generates a random floating-point number within a given range.",
        "flip": "Generates a random boolean value (true or false)."
        };

    const operators = {
        '=': "Equality symbol `=` defines evaluation rules for expressions and can be read as `can be evaluated as` or `can be reduced to`.",
        '+': 'Addition operator.',
        '-': 'Subtraction operator.',
        '*': 'Multiplication operator.',
        '/': 'Division operator.',
        '<': 'Less than operator.',
        '>': 'Greater than operator.',
        '<=': 'Less than or equal to operator.',
        '>=': 'Greater than or equal to operator.',
        '==': '`==` has the type `(-> $t $t Bool)`. This means that the arguments can be of an arbitrary but same type.',
        ':' : 'Colon symbol `:` is used for type declarations.',
        '->': 'Arrow symbol `->` defines type restrictions for evaluable expressions.',
        '%' : 'Modulus operator'
    };

    if (word.startsWith('$') && word !== '$_') {
        return `${word} is a variable.`;
    }

    if (operators[word]) {
        return operators[word];
    }

    return hoverMessages[word] || `No hover information available for ${word}`;
}

module.exports = {
    activate
};
