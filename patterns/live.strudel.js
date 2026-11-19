// 07 "Sugar Glitch" · hyperpop, 160 BPM, D major, 80 bars (~2:00)
// Cooked live 2026-11-19. intro 8 · groove 8 · hook 16 · switch 4 · drop 16 · switch 4 · drop 16 · outro 8
// @q 4
// @top
setcpm(160/4)

const chords = "<D A Bm G>"
const arpLine = "<[0 4 7 11 14 11 7 4] [-3 1 4 8 11 8 4 1] [-2 2 5 9 12 9 5 2] [-4 0 3 7 10 7 3 0]>"
const hookLine = "<[11 ~ 11 12 14 ~ 12 11] [~ 12 ~ 11 9 ~ ~ ~] [11 ~ 11 12 14 ~ 16 14] [12 ~ 11 ~ 9 ~ 7 ~]>"

const arp = (up, g) => n(arpLine).add(up).scale("D:major").s("triangle").decay(.12).sustain(0)
  .delay(.45).delaytime(3/16).delayfeedback(.5).pan(sine.fast(2)).room(.4).gain(g)
const ticks = s("hh*16").bank("RolandTR808").crush(4).speed(2.5).degradeBy(.55).gain(.22)
const kick = s("bd ~ ~ bd ~ bd ~ ~").bank("RolandTR808").shape(.75).gain(1.05)
const snare = s("~ ~ [sd,cp] ~ ~ ~ [sd,cp] ~").bank("RolandTR808").crush(6).room(.25).gain(.8)
const hats = s("hh*8").bank("RolandTR808").ply("<1 2 1 [2 4]>").gain("[.32 .2]*4")
const bass = note("<d1 a0 b0 g0>").struct("x ~ ~ x ~ x ~ ~").s("sine")
  .shape(.9).decay(.45).sustain(.35).lpf(1100).gain(.8)
const stabs = chord(chords).voicing().struct("~ x ~ x ~ x x ~").s("supersaw")
  .lpf(6000).decay(.2).sustain(.4).release(.1).room(.3).gain(.32)
const wall = chord(chords).voicing().s("supersaw").add(note(12))
  .lpf(7000).attack(.01).release(.3).room(.35).gain(.3)
const pluck8 = chord(chords).voicing().struct("x*8").s("square")
  .decay(.09).sustain(0).lpf(4500).gain("[.2 .12]*4")
const hook = (up) => n(hookLine).add(up).scale("D:major").s("square").vowel("<i e i a>").lpf(6000)
  .decay(.14).sustain(.3).sometimesBy(.3, x => x.ply(2))
  .delay(.2).delaytime(1/8).room(.3).gain(.33)
const switchUp = stack(
  n(arpLine).add(21).scale("D:major").s("triangle").rev().fast(2).crush(5).decay(.08).sustain(0).pan(rand).gain(.3),
  s("bd*<4 8 16 32>").bank("RolandTR808").shape(.6).gain(saw.range(.5, 1).slow(4)),
  s("hh*32").bank("RolandTR808").speed(perlin.range(1, 3)).crush(4).degradeBy(.3).gain(.25),
  chord(chords).voicing().struct("x*16").s("supersaw").crush("<8 6 4 3>")
    .lpf(saw.range(8000, 600).slow(4)).decay(.06).sustain(0).gain(.3),
  n("[11 14 16 18]*2").scale("D:major").s("square").vowel("i")
    .ply("<2 4 8 [8 16]>").decay(.05).sustain(0).pan(sine.fast(8)).gain(.2),
)
const drop = stack(kick, snare, hats, bass, wall, pluck8, hook(7), arp(21, .2))

arrange(
  [8,  stack(arp(14, .4), ticks)],
  [8,  stack(arp(14, .32), kick, snare, hats, bass, stabs)],
  [16, stack(arp(14, .32), kick, snare, hats, bass, stabs, hook(0))],
  [4,  switchUp],
  [16, drop],
  [4,  switchUp],
  [16, drop],
  [8,  stack(arp(14, .35).crush(6), ticks)],
)
