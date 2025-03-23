;; Sample MeTTa file to test Go to Definition feature

;; Function definition using = operator
(= (add $x $y)
   (+ $x $y))

(= (subtract $x $y)
   (- $x $y))

(= (multiply $x $y)
   (* $x $y))

(= (squared $n)
   (multiply $n $n))

;; Function calls using ! operator
!(add 5 10)
!(subtract 20 7)
!(multiply 4 6)
!(squared 5)

;; Nested function calls
!(add (multiply 2 3) (subtract 10 5)) 