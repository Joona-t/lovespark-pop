// 05 hyperpop, 160 BPM, D major. Distorted 808s, pitched-up glitch chops, sugar leads.
setcpm(160/4)

$: s("bd ~ ~ bd ~ bd ~ ~").bank("RolandTR808").shape(.6).gain(1.1)
$: s("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808").crush(6).gain(.8)
$: s("hh*8").bank("RolandTR808").fast("<1 2 1 [2 4]>").gain(.35)
$: note("d1 ~ ~ d1 ~ ~ a0 ~").s("sine").shape(.7).decay(.4).sustain(.2).gain(.8)
$: chord("<D Bm G A>").voicing().s("supersaw").lpf(5000).attack(.01).release(.3)
  .struct("x ~ x x ~ x ~ x").gain(.35)
$: n("<[7 9 11 14] [14 11 9 7]>*2".add(7)).scale("D:major")
  .s("square").lpf(4000).vowel("i").speed(1)
  .sometimesBy(.25, x => x.ply(2)).jux(rev).delay(.2).gain(.25)
$: s("numbers:3*8").speed("<2 2.5 3 1.5>").chop(4).degradeBy(.5)
  .coarse("<1 4 8>").gain(.25)
