// 12 (untitled) · John Summit-style tech house, 127 BPM, G minor
// Stage 1 (2026-11-21): kick + bass only. The bassline is the track; everything else waits for Joona's ears.
// @q 4
setcpm(127/4)

// ---- the bassline: 2 bars of 16ths, never on the kick, always answering it ----
// bar 1 sits on G and dips to F; bar 2 climbs D -> C -> Bb back home
const line = note(`<
  [~ g1 ~ g1 ~ ~ g1 ~ ~ g1 bb1 ~ ~ g1 ~ f1]
  [~ g1 ~ g1 ~ ~ g1 ~ ~ g1 d2 ~ ~ c2 bb1 ~]>`)

// two layers, one bass: a clean sine for the weight, a driven saw an octave up for the note you hear on a phone
const sub = line.s("sine").attack(.002).decay(.16).sustain(0).release(.03).gain(.85)
const growl = line.add(note(12)).s("sawtooth")
  .lpf(380).lpq(5).ftype("ladder").lpattack(.001).lpenv(3).lpdecay(.07).lpsustain(0)
  .attack(.001).decay(.13).sustain(0).release(.03).shape(.35).gain(.42)
const bass = stack(sub, growl).orbit(3)

// ---- kick: 909, four on the floor, ducks the bass so they never fight ----
const kick = s("bd*4").bank("RolandTR909").shape(.25).gain(.8)
  .orbit(9).duckorbit(3).duckattack(.12).duckdepth(.7)

stack(kick, bass)
