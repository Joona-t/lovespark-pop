// 02 pop house, 122 BPM, C major. Piano stabs, offbeat bass, bright and warm.
setcpm(122/4)

$: s("bd*4").bank("RolandTR909")
$: s("~ hh:1").bank("RolandTR909").fast(2).gain(.45)
$: s("~ cp").bank("RolandTR909").fast(1).room(.25).gain(.55)
$: s("[~ ~ ~ sh]*4").gain(.3)
$: note("~ c2 ~ c2 ~ a1 ~ g1").s("square").lpf(700).decay(.15).sustain(0).gain(.6)
$: chord("<C Am F G>").voicing().struct("~ x ~ x ~ x x ~")
  .s("piano").room(.4).gain(.7)
$: n("<[4 ~ 2 ~ 0 ~ ~ ~] [4 5 4 2 ~ ~ ~ ~]>".add(7)).scale("C:major")
  .s("sine").vowel("o").delay(.3).delaytime(1/4).gain(.3)
