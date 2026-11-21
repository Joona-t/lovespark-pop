// 12 (untitled) · deadmau5 x John Summit, 127 BPM, G minor
// Stage 1 (2026-11-21): the musical idea, nothing else. mau5 chords and pluck, a synth melody, Summit's rolling bass, a kick.
// Nothing repeats inside 16 bars: 8 chords in two halves, a 16-bar melody, a bass that follows every chord.
// (Scrapped the same day: a Summit-only bass loop, then a Ganacci-style bounce.)
// @q 4
setcpm(127/4)

// ---- harmony: 16 bars, a new chord every 2 bars, top notes move by step ----
// first half:  Gm9 · Ebmaj9 · Bbmaj9 · Fsus4 -> F          (home, warm)
// second half: Cmaj9 · Ebmaj9 · Bb/D · Dsus4 -> D major    (C major is borrowed from G major: the bittersweet lift;
//              Eb pulls it back to minor, then the D major leads home to G minor)
const chords = note(`<
  [g3,bb3,d4,f4,a4]!2   [eb3,g3,bb3,d4,f4]!2  [f3,a3,c4,d4,f4]!2  [f3,bb3,c4,f4] [f3,a3,c4,f4]
  [e3,g3,b3,d4]!2       [eb3,g3,bb3,d4,g4]!2  [d3,f3,bb3,d4,f4]!2 [d3,g3,a3,d4]  [d3,fs3,a3,d4]>`)
const roots = note("<g1!2 eb1!2 bb1!2 f1!2 c2!2 eb1!2 d2!4>")

// ---- the melody: 16 bars. Bars 1-8 ask, bars 9-16 answer higher and land on F# over the D major ----
const tune = note(`<
  [d5 ~ ~ bb4 ~ ~ a4 ~]   [g4 ~ ~ ~ ~ ~ a4 bb4]
  [g4 ~ ~ bb4 ~ ~ d5 ~]   [f5 ~ ~ ~ d5 ~ ~ ~]
  [c5 ~ ~ d5 ~ ~ f5 ~]    [a5 ~ ~ ~ f5 ~ d5 ~]
  [c5 ~ ~ bb4 ~ ~ c5 ~]   [a4 ~ ~ ~ ~ ~ ~ ~]
  [e5 ~ ~ d5 ~ ~ c5 ~]    [g5 ~ ~ ~ ~ e5 d5 ~]
  [bb4 ~ ~ d5 ~ ~ g5 ~]   [f5 ~ ~ ~ g5 ~ bb5 ~]
  [a5 ~ ~ f5 ~ ~ d5 ~]    [bb4 ~ ~ d5 ~ f5 ~ ~]
  [g5 ~ ~ ~ a5 ~ g5 ~]    [fs5 ~ ~ ~ ~ ~ d5 ~]>`)

// ---- the mau5 pluck: detuned saws, resonant ladder filter that breathes over the 16 bars ----
const pluck = chords.struct("<x*16 [x x ~ x x x ~ x x x ~ x x ~ x x]>")
  .s("sawtooth").unison(2).detune(.14)
  .lpf(sine.range(700, 2800).slow(16)).lpq(7).ftype("ladder")
  .lpattack(.001).lpenv(3.5).lpdecay(.11).lpsustain(0)
  .attack(.001).decay(.19).sustain(0).release(.04).gain("[.6 .34 .46 .34]*4")
  .delay(.28).delaytime(3/16).delayfeedback(.42).room(.35).size(.7)
  .pan(sine.range(.42, .58).slow(12)).orbit(2)

// ---- the lead: one warm saw voice, long notes ring, delay fills the gaps ----
const lead = tune.s("sawtooth").unison(3).detune(.1)
  .lpf(sine.range(1800, 4200).slow(16)).lpq(3)
  .attack(.01).decay(.3).sustain(.35).release(.25).gain(.3)
  .delay(.4).delaytime(3/16).delayfeedback(.5).room(.5).size(.8).orbit(4)

// ---- Summit's rolling bass: never on the kick, follows each chord, a different fill every bar ----
const line = roots.struct("<[~ x ~ x ~ ~ x ~ ~ x x ~ ~ x ~ x] [~ x ~ x ~ ~ x ~ ~ x x ~ x ~ x ~]>")
  .add(note("0 0 0 0 0 0 0 0 0 0 <12 7> 0 <0 12> 0 <7 12 7 12> <7 0 12 0>"))   // only root, fifth, octave: in key over every chord
const sub = line.s("sine").attack(.002).decay(.16).sustain(0).release(.03).gain(.8)
const growl = line.add(note(12)).s("sawtooth")
  .lpf(380).lpq(5).ftype("ladder").lpattack(.001).lpenv(3).lpdecay(.07).lpsustain(0)
  .attack(.001).decay(.13).sustain(0).release(.03).shape(.35).gain(.38)
const bass = stack(sub, growl).orbit(3)

// ---- kick: 909, four on the floor, ducks the pluck and the bass ----
const kick = s("bd*4").bank("RolandTR909").shape(.2).gain(.68)
  .orbit(9).duckorbit("2:3").duckattack(.18).duckdepth(.75)

stack(kick, bass, pluck, lead)
