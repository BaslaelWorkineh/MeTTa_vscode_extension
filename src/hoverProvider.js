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
            '=': 'Defines a reduction rule for expressions. Parameters: `Pattern`, `Result`. Returns: Not reduced itself unless custom equalities over equalities are added. Example: `(= (add 1 2) 3)`',
            'id': 'Returns its argument unchanged. Parameters: `Input` (Any atom). Returns: The input atom. Example: `!(id 5)`',
            'ErrorType': 'Type of the atom which contains error. Type: `Type`',
            'Error': 'Constructs an error atom, indicating a problem during evaluation. Parameters: `Atom` (the atom where the error occurred), `Message` (An error message, such as BadType). Returns: An error atom. Example: `(Error (add "a" 2) BadType)`',
            'if-error': 'Checks if an atom is an error. Returns one value if it is, and another if it is not. Parameters: `Atom` (the atom to check), `Then` (Value to return if the atom is an error), `Else` (Value to return otherwise). Returns: Either the `Then` or `Else` argument. Example: `!(if-error (Error 5 BadType) "Error!" "No error")`',
            'return-on-error': 'Returns the first argument if it is an `Empty` or an error. Returns the second argument otherwise. Parameters: `Atom` (Atom to check), `Then` (Atom for further evaluation if the first argument is not an `Error` or `Empty`). Returns: The previous result if it is an error or `Empty`, or continue evaluation. Example: `!(return-on-error (Error 5 BadType) 6)` / `!(return-on-error 5 6)`',
            'return': 'Returns a value from a function expression. Parameters: `Value` (The value to return). Returns: The input value. Example: `(function (return 5))`',
            'function': 'Evaluates the argument until it becomes `(return <result>)`, then reduces to `<result>`. Parameters: `Atom` (The atom to be evaluated). Returns: The result of the atom’s evaluation. Example: `!(function (+ 1 2))`',
            'eval': 'Evaluates an atom, performing one step of reduction. This can be via equality rules or grounded functions. Parameters: `Atom` (The atom to evaluate). Returns: The result of the evaluation. Example: `(= (double $x) (+ $x $x))` / `!(eval (double 5))` / `!(eval (+ 5 5))`',
            'evalc': 'Evaluates an atom within a specific atomspace context. Parameters: `Atom` (The atom to evaluate), `Space` (The atomspace in which to evaluate the atom). Returns: The result of the evaluation.',
            'chain': 'Evaluates an atom, binds the result to a variable, and then evaluates another atom containing the variable. Parameters: `Atom` (The atom to evaluate initially), `Variable` (The variable to bind the result to), `Template` (The atom to evaluate after binding). Returns: The result of evaluating the template. Example: `!(chain (+ 2 3) $x (* $x 2))`',
            'unify': 'Attempts to unify two atoms. If successful, returns one value; otherwise, returns another. Parameters: `Atom1` (The first atom to unify), `Atom2` (The second atom to unify), `Then` (The value to return if unification succeeds), `Else` (The value to return if unification fails). Returns: Either the `Then` or `Else` argument. Example: `!(unify A A "Matched!" "Didn\'t match")` / `!(unify A B "Matched!" "Didn\'t match")`',
            'switch': 'Subsequently tests multiple pattern-matching conditions for the given value. Parameters: `Atom` (Atom to be matched with patterns), `Cases` (Tuple of pairs mapping condition patterns to results). Returns: Result which corresponds to the pattern which is matched with the passed atom first. Example: `!(switch 2 ((1 "one") (2 "two") (3 "three")))`',
            'case': 'Subsequently tests multiple pattern-matching conditions for the given value. Parameters: `Atom` (Atom to be matched with patterns. Note that this atom will be evaluated), `Cases` (Tuple of pairs mapping condition patterns to results). Returns: Result of evaluating `Atom` bound to met condition. Example: `!(case 2 ((1 "one") (2 "two") (3 "three")))`',
            'let': 'Unifies two atoms and apply result of the unification on the third argument. Second argument is evaluated before unification. Parameters: `Pattern` (First atom to be unified), `Atom` (Second atom to be unified), `Template` (Expression which will be evaluated if two first arguments can be unified). Returns: Third argument or `Empty`. Example: `!(let $x 5 (+ $x 2))`',
            'let*': 'Same as `let` but inputs a list of pairs of atoms to be unified. Parameters: `Pairs` (List of pairs, atoms in each pair to be unified), `Template` (Expression which will be evaluated if each pair can be unified). Returns: Second argument or `Empty`. Example: `!(let* (($x 5) ($y 10)) (+ $x $y))`',
            'if': 'Replaces itself by one of the arguments depending on the condition. Parameters: `Condition` (Boolean condition), `Then` (Result when condition is `True`), `Else` (Result when condition is `False`). Returns: Second or third argument. Example: `!(if True 5 10)` / `!(if False 5 10)`',
            'cons-atom': 'Constructs an expression (list) by adding an atom to the head of another expression. Parameters: `Head` (The atom to add to the beginning), `Tail` (The expression to add the atom to). Returns: A new expression. Example: `!(cons-atom 1 (2 3))`',
            'decons-atom': 'Deconstructs an expression into its head and tail. Parameters: `Expression` (The expression to deconstruct). Returns: An expression containing the head and tail: `(Head Tail)`. Example: `!(decons-atom (1 2 3))`',
            'car-atom': 'Extracts the first atom of an expression. Parameters: `Expression` (The expression to extract the first atom from). Returns: The first atom of the expression. Example: `!(car-atom (1 2 3))`',
            'cdr-atom': 'Extracts the tail of an expression (all atoms except the first). Parameters: `Expression` (The expression to extract the tail from). Returns: The tail of the expression. Example: `!(cdr-atom (1 2 3))`',
            'size-atom': 'Returns the size of an expression. Parameters: `Expression` (The expression to get the size). Returns: Size of an expression. Example: `!(size-atom (1 2 3))`',
            'index-atom': 'Returns the atom from an expression using an index, or an error if the index is out of bounds. Parameters: `Expression` (The expression to extract from), `Index` (The index of the atom). Returns: Atom from an expression in the place defined by index. Error if the index is out of bounds. Example: `!(index-atom (1 2 3) 1)`',
            'pow-math': 'Calculates the power of a base raised to an exponent. Parameters: `Base` (The base number), `Power` (The exponent). Returns: The result of the power function. Example: `!(pow-math 2 3)`',
            'sqrt-math': 'Calculates the square root of a number. Parameters: `Number` (The number to calculate the square root of. Must be >= 0). Returns: The square root of the number. Example: `!(sqrt-math 9)`',
            'abs-math': 'Calculates the absolute value of a number. Parameters: `Number` (The number to calculate the absolute value of). Returns: The absolute value of the number. Example: `!(abs-math -5)`',
            'log-math': 'Calculates the logarithm of a number with a given base. Parameters: `Base` (The base of the logarithm), `Number` (The number to calculate the logarithm of). Returns: The result of the logarithm function. Example: `!(log-math 10 100)`',
            'trunc-math': 'Returns the integer part of the input value. Parameters: `Float` (Input float value). Returns: Integer part of float. Example: `!(trunc-math 5.6)`',
            'ceil-math': 'Returns the smallest integer greater than or equal to the input value. Parameters: `Float` (Input float value). Returns: Integer value greater than or equal to the input. Example: `!(ceil-math 5.2)`',
            'floor-math': 'Returns the largest integer less than or equal to the input value. Parameters: `Float` (Input float value). Returns: Integer value less than or equal to the input. Example: `!(floor-math 5.8)`',
            'round-math': 'Returns the nearest integer to the input float value. Parameters: `Float` (Input float value). Returns: Nearest integer to the input. Example: `!(round-math 5.4)` / `!(round-math 5.6)`',
            'sin-math': 'Returns the result of the sine function for an input value in radians. Parameters: `Angle` (Angle in radians). Returns: Result of the sine function. Example: `!(sin-math 0)`',
            'asin-math': 'Returns the result of the arcsine function for an input value. Parameters: `Float` (Input float value). Returns: Result of the arcsine function. Example: `!(asin-math 0)`',
            'cos-math': 'Returns the result of the cosine function for an input value in radians. Parameters: `Angle` (Angle in radians). Returns: Result of the cosine function. Example: `!(cos-math 0)`',
            'acos-math': 'Returns the result of the arccosine function for an input value. Parameters: `Float` (Input float value). Returns: Result of the arccosine function. Example: `!(acos-math 1)`',
            'tan-math': 'Returns the result of the tangent function for an input value in radians. Parameters: `Angle` (Angle in radians). Returns: Result of the tangent function. Example: `!(tan-math 0)`',
            'atan-math': 'Returns the result of the arctangent function for an input value. Parameters: `Float` (Input float value). Returns: Result of the arctangent function. Example: `!(atan-math 0)`',
            'isnan-math': 'Returns `True` if the input value is `NaN`. `False` - otherwise. Parameters: `Number` (Number). Returns: `True`/`False`. Example: `!(isnan-math 0.0)`',
            'isinf-math': 'Returns `True` if the input value is positive or negative infinity. `False` - otherwise. Parameters: `Number` (Number). Returns: `True`/`False`. Example: `!(isinf-math 0.0)`',
            'min-atom': 'Returns the atom with the minimum value in the expression. Only numbers allowed. Parameters: `Expression` (Expression which contains atoms of Number type). Returns: The minimum value in the expression. Error if the expression contains a non-numeric value or is empty.',
            'max-atom': 'Returns the atom with the maximum value in the expression. Only numbers allowed. Parameters: `Expression` (Expression which contains atoms of Number type). Returns: The maximum value in the expression. Error if the expression contains a non-numeric value or is empty.',
            'random-int': 'Returns a random integer number from the range defined by two numbers. Parameters: `Range start` (Range start), `Range end` (Range end). Returns: Random int number from defined range.',
            'random-float': 'Returns a random float number from the range defined by two numbers. Parameters: `Range start` (Range start), `Range end` (Range end). Returns: Random float number from defined range.',
            'collapse-bind': 'Evaluates a MeTTa operation and returns an expression containing all alternative evaluations in the form `(Atom Bindings)`. Parameters: `Atom` (The MeTTa operation to evaluate). Returns: An expression of alternative evaluations with bindings.',
            'superpose-bind': 'Takes the result of `collapse-bind` and returns only the result atoms, discarding the bindings. Parameters: `Expression` (An expression in the form `(Atom Bindings)`). Returns: A non-deterministic list of atoms. Example: `!(superpose-bind ((A (Grounded ...)) (B (Grounded ...))))`',
            'superpose': 'Turns a tuple into a non-deterministic result. Parameters: `Tuple` (Tuple to be converted). Returns: Argument converted to a non-deterministic result. Example: `!(superpose (A B C))`',
            'collapse': 'Converts a non-deterministic result into a tuple. Parameters: `Atom` (Atom which will be evaluated). Returns: `Tuple`. Example: `!(collapse (superpose (A B C)))`',
            'is-function': 'Checks if a type is a function type. Parameters: `Type` (The type atom to check). Returns: `True` if the type is a function type, `False` otherwise. Example: `!(is-function (-> Atom Atom))` / `!(is-function Atom)`',
            'type-cast': 'Attempts to cast an atom to a specific type within an atomspace context. Parameters: `Atom` (The atom to cast), `Type` (The target type), `Space` (The atomspace to use as context). Returns: The atom if casting is successful, or an `Error` atom if not.',
            'match-types': 'Checks if two types can be unified and returns one value if so, another - otherwise. Parameters: `Type1` (The first type), `Type2` (The second type), `Then` (Atom to be returned if types can be unified), `Else` (Atom to be returned if types cannot be unified). Returns: Third or fourth argument. Example: `!(match-types Atom Atom "Matched!" "Didn\'t match")` / `!(match-types Atom Number "Matched!" "Didn\'t match")`',
            'first-from-pair': 'Gets a pair as a first argument and returns the first atom from the pair. Parameters: `Pair` (Pair). Returns: The first atom from a pair. Example: `!(first-from-pair (A B))`',
            'match-type-or': 'Checks if two types can be unified and returns the result of an OR operation between the first argument and the type checking result. Parameters: `Folded` (Boolean value), `Next` (First type), `Type` (Second type). Returns: `True` or `False`.',
            'filter-atom': 'Filters a list of atoms based on a predicate. Parameters: `List` (The list of atoms to filter), `Variable` (The variable to use in the predicate), `Filter` (The predicate to apply - an expression that returns `True` or `False`). Returns: A new list containing only the atoms that satisfy the predicate. Example: `!(filter-atom (1 2 3 4 5) $x (> $x 3))`',
            'map-atom': 'Applies a function to each atom in a list, creating a new list with the results. Parameters: `List` (The list of atoms to map over), `Variable` (The variable to use in the mapping expression), `Map` (The expression to apply to each atom). Returns: A new list with the mapped values. Example: `!(map-atom (1 2 3) $x (+ $x 1))`',
            'foldl-atom': 'Folds (reduces) a list of values into a single value, using a binary operation. This is a left fold. Parameters: `List` (The list of values to fold), `Init` (The initial value), `A` (The variable to hold the accumulated value), `B` (The variable to hold the current element of the list), `Op` (The binary operation to apply - an expression using `A` and `B`). Returns: The final accumulated value. Example: `!(foldl-atom (1 2 3 4) 0 $acc $x (+ $acc $x))`',
            'or': 'Logical disjunction of two arguments. Parameters: `Arg1` (First argument), `Arg2` (Second argument). Returns: `True` if any of the input arguments are `True`, `False` otherwise. Example: `!(or True False)`',
            'and': 'Logical conjunction of two arguments. Parameters: `Arg1` (First argument), `Arg2` (Second argument). Returns: Returns `True` if both arguments are `True`, `False` - otherwise. Example: `!(and True False)` / `!(and True True)`',
            'not': 'Logical negation. Parameters: `Arg` (Argument). Returns: Negates a boolean input argument (`False` -> `True`, `True` -> `False`). Example: `!(not True)` / `!(not False)`',
            'xor': 'Logical exclusive or. Parameters: `Arg1` (First argument), `Arg2` (Second argument). Returns: Returns `True` if one and only one of the inputs is `True`. Example: `!(xor True False)` / `!(xor True True)`',
            'flip': 'Random boolean value. Parameters: `None`. Returns: Returns a uniformly distributed random boolean value. Example: `!(flip)`',
            'add-reduct': 'Reduces an atom and adds it to the atomspace. Parameters: `Space` (The atomspace to add the atom to), `Atom` (The atom to add). Returns: Unit atom. Example: `!(add-reduct &self (Foo Bar))`',
            'add-atom': 'Adds an atom into the atomspace without reducing it. Parameters: `Space` (Atomspace to add the atom into), `Atom` (Atom to add). Returns: Unit atom',
            'get-type': 'Returns the type notation of the input atom. Parameters: `Atom` (Atom to get the type for). Returns: Type notation or `%Undefined%` if there is no type for the input Atom',
            'get-type-space': 'Returns the type notation of the input Atom relative to a specified atomspace. Parameters: `Space` (Atomspace where type notation for the input atom will be searched), `Atom` (Atom to get the type for). Returns: Type notation or `%Undefined%` if there is no type for the input Atom in the provided atomspace',
            'get-metatype': 'Returns the metatype of the input atom. Parameters: `Atom` (Atom to get metatype for). Returns: Metatype of the input atom',
            'if-equal': 'Checks if the first two arguments are equal and evaluates the third argument if equal, and the fourth argument otherwise. Parameters: `Arg1` (First argument), `Arg2` (Second argument), `Then` (Atom to be evaluated if arguments are equal), `Else` (Atom to be evaluated if arguments are not equal). Returns: Evaluated third or fourth argument',
            'new-space': 'Creates a new Atomspace which could be used further in the program as a separate Atomspace from `&self`. Parameters: None. Returns: A reference to a new space.',
            'remove-atom': 'Removes an atom from the input Atomspace. Parameters: `Space` (Reference to the space from which the Atom needs to be removed), `Atom` (Atom to be removed). Returns: Unit atom',
            'get-atoms': 'Shows all atoms in the input Atomspace. Parameters: `Space` (Reference to the space). Returns: List of all atoms in the input space',
            'match': 'Searches for all declared atoms corresponding to the given pattern inside space and returns the output template. Parameters: `Space` (Atomspace to search pattern), `Pattern` (Pattern atom to be searched), `Output` (Output template typically containing variables from the input pattern). Returns: If the match was successful, it outputs the template with filled variables using the matched pattern. `Empty` - otherwise',
            'quote': 'Prevents an atom from being reduced. Parameters: `Atom` (The atom to quote). Returns: The quoted atom (which will not be evaluated). Example: `!(eval (quote (+ 1 2)))`',
            'unquote': 'Removes the quote from a quoted atom. Parameters: `QuotedAtom` (The atom to unquote). Returns: The original, unquoted atom. Example: `!(unquote (quote (+ 1 2)))`',
            'noreduce-eq': 'Checks equality of two atoms without reducing them. Parameters: `A` (First atom), `B` (Second atom). Returns: `True` if the not reduced atoms are equal, `False` - otherwise. Example: `!(noreduce-eq (+ 1 2) (+ 1 2))` / `!(noreduce-eq (+ 1 2) 3)`',
            'unique': 'Returns unique entities from non-deterministic input. Parameters: `Arg` (Non-deterministic set of values). Returns: Unique values from the input set. Example: `!(unique (superpose (a b c d d)))`',
            'union': 'Returns the union of two non-deterministic inputs. Parameters: `Arg1` (Non-deterministic set of values), `Arg2` (Another non-deterministic set of values). Returns: Union of sets. Example: `!(union (superpose (a b b c)) (superpose (b c c d)))`',
            'intersection': 'Returns the intersection of two non-deterministic inputs. Parameters: `Arg1` (Non-deterministic set of values), `Arg2` (Another non-deterministic set of values). Returns: Intersection of sets. Example: `!(intersection (superpose (a b c c)) (superpose (b c c c d)))`',
            'subtraction': 'Returns the subtraction of two non-deterministic inputs. Parameters: `Arg1` (Non-deterministic set of values), `Arg2` (Another non-deterministic set of values). Returns: Subtraction of sets. Example: `!(subtraction (superpose (a b b c)) (superpose (b c c d)))`',
            'unique-atom': 'Takes a tuple and returns only unique entities. Parameters: `List` (List of values). Returns: Unique values from the input set. Example: `!(unique-atom (a b c d d))`',
            'union-atom': 'Takes two tuples and returns their union. Parameters: `List1` (List of values), `List2` (List of values). Returns: Union of sets. Example: `!(union-atom (a b b c) (b c c d))`',
            'intersection-atom': 'Takes two tuples and returns their intersection. Parameters: `List1` (List of values), `List2` (List of values). Returns: Intersection of sets. Example: `!(intersection-atom (a b c c) (b c c c d))`',
            'subtraction-atom': 'Takes two tuples and returns their subtraction. Parameters: `List1` (List of values), `List2` (List of values). Returns: Subtraction of sets. Example: `!(subtraction-atom (a b b c) (b c c d))`',
            '@doc': "Documentation I have little detail about this currently"
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
