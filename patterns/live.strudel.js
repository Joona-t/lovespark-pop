// cook 3: clap, supersaw chords on a slow filter sweep
setcpm(128/4)

$: s("bd*4").bank("RolandTR909")
$: s("[~ hh]*4").bank("RolandTR909").gain(.45)
$: s("~ cp ~ cp").bank("RolandTR909").room(.3).gain(.55)
$: note("a1 a1 a2 a1 c2 a1 g1 a1").s("sawtooth")
  .lpf(sine.range(300, 1800).slow(8)).lpq(10).decay(.12).sustain(0).gain(.6)
$: chord("<Am F C G>").voicing().s("supersaw")
  .lpf(sine.range(600, 4000).slow(16)).attack(.3).release(1).room(.5).gain(.3)
