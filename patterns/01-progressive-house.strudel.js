// 01 progressive house, 124 BPM, A minor. Long filter build over a rolling bass.
setcpm(124/4)

$: s("bd*4").bank("RolandTR909").gain(.95)
$: s("~ hh ~ hh").bank("RolandTR909").gain(.5)
$: s("~ cp ~ cp").bank("RolandTR909").room(.3).gain(.6)
$: note("a1 a1 a2 a1 c2 a1 g1 a1").s("sawtooth")
  .lpf(sine.range(300, 1400).slow(16)).lpq(8)
  .decay(.12).sustain(0).gain(.7)
$: chord("<Am F C G>").voicing().s("supersaw")
  .lpf(sine.range(600, 4000).slow(32)).attack(.4).release(1.2)
  .room(.6).gain(.35)
$: n("0 2 4 7 9 7 4 2").scale("A:minor").s("triangle").fast(2)
  .delay(.4).delaytime(3/8).delayfeedback(.45).pan(sine.slow(4)).gain(.25)
