// 08 "Wake Signal (Extended Mix)" · deadmau5 x john summit style, 126 BPM, F minor, 120 bars (~3:49)
// Developed live 2026-11-19 from 06. intro 16 · build 8 · hook 16 · break 8 · drop 16 · summit groove 16 · break 8 · drop 16 · outro 16
setcpm(126/4)

const chords = "<Fm7 Db^7 Ab^7 Eb>"
const kick = s("bd*4").bank("RolandTR909").shape(.2).mask("<1!7 [1 1 1 0]>").gain(1.05)
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.25).gain(.6)
const fill = s("<~!7 [~ ~ cp*4 cp*8]>").bank("RolandTR909").gain(.5)
const hats = s("hh*8").bank("RolandTR909").swingBy(1/6, 4).gain("[.25 .5]*4")
const open = s("[~ oh]*4").bank("RolandTR909").gain(.35)
const toms = s("~ lt ~ [mt lt] ~ [lt ~] mt ~").bank("RolandTR909").swingBy(1/6, 4).gain(.35)
const bass = note("<f1 db1 ab0 eb1>").struct("[~ x x x]*4").s("sawtooth")
  .lpf(sine.range(260, 1100).fast(4)).lpq(9).decay(.11).sustain(0).gain(.6)
const rollingBass = note("<f1 db1 ab0 eb1>").struct("[x ~ x x] [~ x ~ x] [x ~ x x] [~ x x ~]")
  .add(note("[0 0 12 0]*4")).s("sawtooth")
  .lpf(sine.range(300, 1300).fast(4)).lpq(10).decay(.12).sustain(0).gain(.6)
const plucks = (lo, hi) => chord(chords).voicing().struct("x*16").s("sawtooth").detune(.25)
  .decay(.13).sustain(0).lpf(saw.range(lo, hi).slow(8)).lpq(6)
  .gain("[.15 .45 .7 .85]*4").room(.35).delay(.2).delaytime(3/16)
const stabs = chord(chords).voicing().struct("<[[~ x] ~ [~ x] ~] [~ ~ [~ x] [x ~]]>")
  .s("square").lpf(2400).decay(.16).sustain(0).room(.4).delay(.3).delaytime(3/16).gain(.32)
const pump = chord(chords).voicing().s("supersaw").segment(16)
  .lpf(3500).release(.2).gain("[.08 .25 .4 .48]*4").room(.4)
const pad = chord(chords).voicing().s("supersaw").attack(.8).release(2).lpf(1800).room(.8).gain(.22)
const hook = (cut) => n("<[~ 11 ~ 11 13 ~ 11 9] [~ 11 ~ 10 9 ~ ~ ~] [~ 11 ~ 11 13 ~ 14 13] [11 ~ 10 ~ 9 ~ ~ ~]>")
  .scale("F:minor").s("sawtooth").vowel("<a o a e>")
  .decay(.18).sustain(.2).lpf(cut).room(.45).delay(.25).delaytime(3/16).gain(.5)
const counter = n("<[16 ~ 15 ~ 14 ~ 13 ~] [14 ~ 13 ~ 11 ~ ~ ~] [16 ~ 15 ~ 14 ~ 16 ~] [18 ~ 16 ~ 14 ~ ~ ~]>")
  .scale("F:minor").s("triangle").decay(.2).sustain(.1)
  .delay(.4).delaytime(3/8).delayfeedback(.4).pan(.7).room(.5).gain(.28)
const riser = s("white*16").decay(.08).sustain(0)
  .lpf(saw.range(400, 9000).slow(8)).gain(saw.range(0, .28).slow(8))
const roll = s("sd*<4 4 8 8 16 16 [16 32] 32>").bank("RolandTR909").gain(saw.range(.15, .7).slow(8))
const drums = stack(kick, clap, fill, hats, open)

arrange(
  [8,  stack(plucks(400, 2400), hats.gain(.3))],
  [8,  stack(plucks(2400, 4200), hats.gain(.3), toms.gain(.25))],
  [8,  stack(kick, clap, fill, hats, bass, plucks(1200, 4800))],
  [16, stack(drums, bass, plucks(1200, 4800), hook(2800))],
  [8,  stack(plucks(800, 6000).decay(.25).gain(.5), pad, hook(1400).gain(.35), riser, roll)],
  [16, stack(drums, bass, plucks(5000, 5200), pump, hook(3400))],
  [16, stack(drums, toms, rollingBass, stabs)],
  [8,  stack(pad, hook(1000).gain(.3), counter.gain(.2), riser, roll)],
  [16, stack(drums, toms.gain(.3), bass, plucks(5000, 5200), pump, hook(3400), counter)],
  [8,  stack(kick, bass, hats, toms.gain(.25), plucks(4200, 1500))],
  [8,  stack(hats.gain(.3), plucks(1500, 300))],
)
