// 04 techno, 132 BPM, F minor. Driving kick, rumble, acid line, minimal hats.
setcpm(132/4)

$: s("bd*4").bank("RolandTR909").shape(.3).gain(1)
$: s("bd*4").bank("RolandTR909").lpf(120).room(.9).roomsize(6).gain(.5)
$: s("[~ oh]*4").bank("RolandTR909").gain(.4)
$: s("hh*16").bank("RolandTR909").degradeBy(.3).gain(.3)
$: s("~ ~ rim ~").bank("RolandTR909").every(4, x => x.fast(2)).gain(.4)
$: note("f1 f1 [f2 f1] ab1 f1 [c2 f1] eb1 f1").s("sawtooth")
  .lpf(perlin.range(300, 3000).slow(4)).lpq(18).shape(.5)
  .decay(.08).sustain(0).gain(.45)
$: note("<f3 ab3 c4 eb4>").s("sine").attack(2).release(4).room(.8).gain(.2)
