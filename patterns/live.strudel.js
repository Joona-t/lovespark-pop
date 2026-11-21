// 12 (untitled) · Salvatore Ganacci-style bouncy house, 126 BPM, A minor
// Stage 1 (2026-11-21): kick + the bounce only. One rubbery off-beat bass that is also the hook.
// (The first try, a John Summit-style rolling bass, was scrapped the same day.)
// @q 4
setcpm(126/4)

// ---- the bounce: 4 bars of 16ths. Off the kick, jumps an octave, ends each bar with a little joke ----
const line = note(`<
  [~ ~ a1 ~   ~ ~ a1 a2   ~ ~ a1 ~   ~ a2 g2 e2]
  [~ ~ a1 ~   ~ ~ a1 a2   ~ ~ a1 ~   ~ c3 ~ a2]
  [~ ~ f1 ~   ~ ~ f1 f2   ~ ~ g1 ~   ~ g2 ~ b2]
  [~ ~ a1 ~   ~ ~ a1 a2   ~ e2 ~ g2  a2 ~ [a2 a2] ~]>`)

// the donk: an FM sine that goes "boing" (pitch drops into each note), with a hollow square on top
const donk = line.s("sine").fm(3.5).fmh(2).fmdecay(.07).fmsustain(0)
  .penv(9).pdecay(.035)
  .attack(.001).decay(.17).sustain(0).release(.04).shape(.3).gain(.8)
const honk = line.add(note(12)).s("square")
  .lpf(900).lpq(8).lpattack(.001).lpenv(2.5).lpdecay(.06).lpsustain(0)
  .attack(.001).decay(.11).sustain(0).release(.03).gain(.22)
const bounce = stack(donk, honk).orbit(3)

// ---- kick: 909, four on the floor, ducks the bounce ----
const kick = s("bd*4").bank("RolandTR909").shape(.25).gain(.8)
  .orbit(9).duckorbit(3).duckattack(.1).duckdepth(.6)

stack(kick, bounce)
