// 06 "Wake Signal" · deadmau5 x john summit style, 126 BPM, F minor, 64 bars (~2:02)
// Cooked live 2026-11-19. Sections: intro 8 · build 8 · hook 16 · breakdown 8 · drop 16 · outro 8
// @q 1
// @top
setcpm(126/4)

const chords = "<Fm7 Db^7 Ab^7 Eb>"
const kick = s("bd*4").bank("RolandTR909").shape(.2).gain(1.05)
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.25).gain(.6)
const hats = s("hh*8").bank("RolandTR909").swingBy(1/6, 4).gain("[.25 .5]*4")
const open = s("[~ oh]*4").bank("RolandTR909").gain(.35)
const bass = note("<f1 db1 ab0 eb1>").struct("[~ x x x]*4").s("sawtooth")
  .lpf(sine.range(260, 1100).fast(4)).lpq(9).decay(.11).sustain(0).gain(.6)
const plucks = (lo, hi) => chord(chords).voicing().struct("x*16").s("sawtooth").detune(.25)
  .decay(.13).sustain(0).lpf(saw.range(lo, hi).slow(8)).lpq(6)
  .gain("[.15 .45 .7 .85]*4").room(.35).delay(.2).delaytime(3/16)
const pump = chord(chords).voicing().s("supersaw").segment(16)
  .lpf(3500).release(.2).gain("[.08 .25 .4 .48]*4").room(.4)
const pad = chord(chords).voicing().s("supersaw").attack(.8).release(2).lpf(1800).room(.8).gain(.22)
// hook in F minor scale degrees (one octave up)
const hook = (cut) => n("<[~ 11 ~ 11 13 ~ 11 9] [~ 11 ~ 10 9 ~ ~ ~] [~ 11 ~ 11 13 ~ 14 13] [11 ~ 10 ~ 9 ~ ~ ~]>")
  .scale("F:minor").s("sawtooth").vowel("<a o a e>")
  .decay(.18).sustain(.2).lpf(cut).room(.45).delay(.25).delaytime(3/16).gain(.5)
const riser = s("white*16").decay(.08).sustain(0)
  .lpf(saw.range(400, 9000).slow(8)).gain(saw.range(0, .28).slow(8))
const roll = s("sd*<4 4 8 8 16 16 [16 32] 32>").bank("RolandTR909").gain(saw.range(.15, .7).slow(8))

arrange(
  [8,  stack(plucks(400, 4200), hats.gain(.3))],
  [8,  stack(kick, clap, hats, bass, plucks(1200, 4800))],
  [16, stack(kick, clap, hats, open, bass, plucks(1200, 4800), hook(2800))],
  [8,  stack(plucks(800, 6000).decay(.25).gain(.5), pad, hook(1400).gain(.35), riser, roll)],
  [16, stack(kick, clap, hats, open, bass, plucks(5000, 5200), pump, hook(3400))],
  [8,  stack(kick, bass, hats, plucks(4200, 300))],
)
