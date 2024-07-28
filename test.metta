(= (length ()) 0)
(= (length (:: $x $xs))
    (+ 1 (length $xs)))
! (length (:: A (:: B (:: C ()))))

(= (factorial $x)
    (if (> $x 0)
        (* $x (factorial (- $x 1)))
        1))
! (factorial 5) ; 120

(= (zip $list1 $list2)
    (case ($list1 $list2)
        (((() ()) ())
            (((:: $x $xs) (:: $y $ys)) (:: ($x $y) (zip $xs $ys)))
            ($else ERROR)
            )
        )
    )
! (zip (:: A (:: B ())) (:: 1 (:: 2 ()))) ; (:: (A 1) (:: (B 2) ()))
! (zip (:: A (:: B ())) (:: 1 ()))
 ; (:: (A 1) ERROR)

((9 9 9) (9 9 9) (9 9 9)) goal
(= (square $w) (* $w $w))
(= (triple $x) ($x $x $x))
(= (grid $y) (triple (triple $y)))
!(grid (square 3))

(= (bin) 0)
(= (bin) 1)

(= (triple $x) ($x $x $x))
!(triple (bin))

(= (bin2) ((bin) (bin)))
!(bin2)

!(triple (bin2))

IF you want every combination of numbers just create non-deterministic function and and call it if the body is two times the combination will be two numbers

(= (sum ($x $y $z)) (+ $x (+ $y $z)))
(= (sum ($x $y)) (+ $x $y))

!(triple (bin))
!(sum (triple(bin)))
!(sum (bin2))
non deterministic increment
(= (inc $x) (+ 1 $x))
(= (inc $x) (+ 0 $x))
!(inc (bin))

Always remember about base case
base case
(= (Length (Nil)) 0)
recursion
(= (Length (Cons $x $xs)) (+ 1 (Length $xs)))
!(Length (Cons A (Cons B (Cons C (Nil)))))

changing list value
(= (SquaredList $f Nill) 0 )

(= (SquaredList $f ($x $xs))
    (+ ($f $x) (SquaredList $f $xs)))

(= (Square $x) (* $x $x))

!(SquaredList Square (1 (2 (3 (4 Nill)))))

Conditional Statements
(= (factorial $x)
    (if (> $x 0) (* $x (factorial (- $x 1))) 1))
!(factorial 5)

merging two lists
(= (zip () ()) (Zipped))
(= (zip (:: $x $xs) (:: $y $ys))
    ((:: $x $y) (zip $xs $ys)))

!(zip (:: A (:: B (:: C ()))) (:: 1 (:: 2 (:: 3 ()))))

Case is basically pattern matching
(= (Zip $list1 $list2)
    (case ($list1 $list2)
        ( ((() ()) ())
            (((:: $x $xs) (:: $y $ys)) (:: $x $y (Zip $xs $ys)) )
            ($else ERROR)
            )
        )
    )

!(Zip (:: A (:: B (:: C ()))) (:: 1 (:: 2 (:: 3 ()))))

Some facts as very basic equalities
(= (Mother Martha) True)
(= (Woman Martha ) True)
(= (Mother Haset) False)
(= (Woman Haset) True)

(= (Big $x)
    (and (Mother $x) (Woman $x))
    )
!(if (Big $x) ($x is Big Person) ($x is Small Person))

(= (green $x)
    (if (Big $x) True (empty)
        )
    )
! (if (green $x) ($x is green) ($x is not green))

(= (bin) 0)
(= (bin) 1)
!(bin)

(= (gen_rand_bin $x)
    (if (> $x 0)
        (:: (bin) (gen_rand_bin (- $x 1)))
        ()
        )
    )
! (gen_rand_bin 3)

(= (bin) 0)
(= (bin) 1)
(= (gen-bin-list ()) ())
(= (gen-bin-list (:: $x $xs))
    (:: (bin) (gen-bin-list $xs))
    )

! (gen-bin-list (:: it (:: it (:: it ()))))

Target sum finding Problem

(= (bin) 0)
(= (bin) 1)

(= (gen-bin ()) ())
(= (gen-bin (:: $x $xs))
    (:: (bin) (gen-bin $xs))
    )

(= (Scalar-Multiple () ()) 0)
(= (Scalar-Multiple (:: $x $xs) (:: $y $ys))
    (+ (* $x $y) (Scalar-Multiple $xs $ys))
    )

(= (Final-Comb $solution $list $target)
    (if (== (Scalar-Multiple $solution $list ) $target)
        ($solution)
        (empty)
        )
    )

 ; ! (gen-bin (:: 2 (:: 3(:: 4 ()))))
(= (list) (:: 2 (:: 3(:: 4 ()))))
(= (target) 7)
!(Final-Comb (gen-bin(list)) (list) (target) )
 ; !(Scalar-Multiple (:: 2 (:: 3(:: 4 ()))) (:: 2 (:: 3(:: 4 ()))))

(Father Workineh Baslael)

!(match &self (Father Workineh Baslael) (Workineh is Baslael's Father))

(Parent Tom Bob)
(Parent Pam Bob)
(Parent Tom Liz)
(Parent Bob Ann)
(Parent Bob Pat)
(Parent Pat Pat)

! (match &self (Parent $x $x) ($x $x))

(= (only-a A) (Input A is accepted))
! (only-a A)
!(match &self (= (only-a A) $result) $result)

(Parent Tom Bob)
(Parent Pam Bob)
(Parent Tom Liz)
(Parent Bob Ann)
(= (get-parent-entries $x $y)
    (match &self (Parent $x $y) (Parent $x $y)))
(= (get-parents $x)
    (match &self (Parent $y $x) $y))
! (get-parent-entries Tom $_)
! (get-parents Bob)

(Parent Tom Bob)
(Parent Pam Bob)
(Parent Tom Liz)
(Parent Bob Ann)
(Parent Bob Pat)
(Parent Pat Jim)

(= (get-parents $x)
    (match &self (Parent $y $x) $y))
(= (get-grand-parents $x)
    (get-parents (get-parents $x)))
! (get-grand-parents Pat)