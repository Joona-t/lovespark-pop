// 03 electro, 128 BPM, E minor. 808 broken kick, robotic bass, crushed stabs.
setcpm(128/4)

$: s("bd ~ ~ bd ~ ~ bd ~ ~ ~ bd ~ ~ bd ~ ~").bank("RolandTR808").gain(1)
$: s("~ ~ ~ ~ sd ~ ~ ~ ~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR808").gain(.8)
$: s("hh*16").bank("RolandTR808").gain(perlin.range(.2, .5))
$: note("e1 ~ e2 e1 ~ g1 ~ e1 b0 ~ e1 ~ d2 ~ e1 ~").s("sawtooth")
  .lpf(sine.range(200, 2500).fast(2)).lpq(14).shape(.4).decay(.1).sustain(0).gain(.6)
$: note("<[e3,g3,b3] [d3,f#3,a3]>").struct("~ x ~ ~ ~ ~ x ~").s("square")
  .crush(5).lpf(3000).room(.3).gain(.35)
$: n("0 ~ 3 ~ 5 ~ 7 5".add(14)).scale("E:minor").s("square").vowel("<a e i o>")
  .sometimesBy(.3, x => x.speed(2)).delay(.25).gain(.2)
