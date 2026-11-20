// 11 "Slow Light" · deadmau5-style progressive house, 128 BPM, F# minor, 152 bars (~4:45)
// Cooked live 2026-11-20 with Joona (chords and synth first, then drums, bass, then the arrangement).
// Balance v2 (his listen): the kick enters soft and comes up section by section (.4, .5, .6, then .68); pluck, bell and lead up about 3 dB.
// The idea: one pluck, one set of chords, and patience. The filter is the story: it opens for four minutes.
// No risers, no snare rolls. A melody arrives in the breakdown as a bell and returns at the drop as a lead.
// Sections: intro 16 · groove 16 · build 16 · breakdown 24 · drop 32 · lift (B chords) 16 · return 16 · outro 16
// @q 4
// @top
setcpm(128/4)

// ---- harmony: drawn like a piano roll, top notes barely move ----
// A: F#m9 (2 bars) · Dmaj9 (2) · Amaj9 (2) · Esus4 -> E      roots F# D A E
const chA = note(`<[fs3,a3,cs4,e4,gs4]!2 [d3,fs3,a3,cs4,e4]!2 [e3,gs3,b3,cs4,e4]!2 [e3,a3,b3,e4] [e3,gs3,b3,e4]>`)
const rtA = note("<fs1!2 d2!2 a1!2 e1!2>")
// B (the lift): Bm9 · Dmaj9 · F#m9 · Esus4 -> E; the top voice climbs C# -> E -> G#      roots B D F# E
const chB = note(`<[d3,fs3,a3,cs4]!2 [d3,fs3,a3,cs4,e4]!2 [fs3,a3,cs4,e4,gs4]!2 [e3,a3,b3,e4] [e3,gs3,b3,e4]>`)
const rtB = note("<b1!2 d2!2 fs1!2 e1!2>")
// the melody: 8 bars, 3-3-2 phrasing, ends A -> G# as the sus4 resolves
const tune = note(`<
  [cs5 ~ ~ b4 ~ ~ a4 ~] [gs4 ~ ~ ~ ~ ~ e4 ~]
  [fs4 ~ ~ a4 ~ ~ cs5 ~] [e5 ~ ~ ~ cs5 ~ ~ ~]
  [b4 ~ ~ cs5 ~ ~ e5 ~] [gs5 ~ ~ ~ e5 ~ ~ ~]
  [a4 ~ ~ b4 ~ ~ cs5 ~] [b4 ~ ~ ~ gs4 ~ ~ ~]>`)

// ---- the mau5 pluck: two detuned saws, resonant ladder low-pass, envelope snaps shut on every 16th ----
// lo..hi: cutoff at the start and end of the section; bars: section length; dec: how long each note rings
const pluck = (ch, lo, hi, bars, dec = .19) => ch.struct("x*16")
  .s("sawtooth").unison(2).detune(.14)
  .lpf(saw.range(lo, hi).slow(bars)).lpq(7).ftype("ladder")
  .lpattack(.001).lpenv(3.5).lpdecay(.11).lpsustain(0)
  .attack(.001).decay(dec).sustain(0).release(.04)
  .gain("[.7 .4 .54 .4]*4")
  .delay(.28).delaytime(3/16).delayfeedback(sine.range(.36, .48).slow(16))
  .room(.35).size(.7).pan(sine.range(.42, .58).slow(12)).orbit(2)

// pad: the same chords held, soft and wide
const pad = (ch) => ch.s("supersaw").unison(5).detune(.4).attack(.9).release(2)
  .hpf(260).lpf(sine.range(1100, 1700).slow(16)).room(.8).size(.9).gain(.13).orbit(2)

// the melody as a bell (breakdown) and as a lead (drop)
const bell = tune.s("sine").fm(1.6).fmh(2).fmdecay(.25).fmsustain(0)
  .attack(.003).decay(.6).sustain(.1).release(.8)
  .delay(.4).delaytime(3/8).delayfeedback(.5).room(.7).size(.9).gain(.44).orbit(4)
const lead = stack(tune.s("sawtooth").gain(.3), tune.sub(note(12)).s("square").gain(.15))
  .hpf(300).lpf(2600).lpq(3).lpenv(2).lpdecay(.3).vib(5).vibmod(.06)
  .attack(.005).decay(.3).sustain(.5).release(.2)
  .delay(.3).delaytime(3/16).delayfeedback(.4).room(.45).orbit(2)

// ---- low end: kick and bass only below 200 Hz; the kick ducks the music and the bass ----
const kick = s("bd*4").bank("RolandTR909").shape(.15).gain(.68)
  .orbit(9).duckorbit("2:3").duckattack(.22).duckdepth(.8)
const bass = (rt) => stack(
    rt.struct("~ x ~ x ~ x ~ [x x]").s("sine").decay(.25).sustain(.6).release(.05).gain(.7),
    rt.struct("~ x ~ x ~ x ~ [x x]").add(note(12)).s("sawtooth").lpf(520).lpq(4).lpenv(2).lpdecay(.1)
      .decay(.2).sustain(.1).release(.04).gain(.32),
  ).orbit(3)
const sub = (rt) => rt.s("sine").attack(.05).release(.3).gain(.5).orbit(3)   // held roots, breakdown only

// ---- tops ----
const clap = s("~ cp ~ cp").bank("RolandTR909").hpf(300).room(.3).gain(.45)
const hats = s("[~ hh]*4").bank("RolandTR909").hpf(5000).gain(.36)
const ticks = s("hh*16").bank("RolandTR909").hpf(8000).gain("[.05 .1 .07 .13]*4")
const open = s("[~ oh]*4").bank("RolandTR909").hpf(4000).gain(.2)
const ride = s("rd*4").bank("RolandTR909").hpf(6000).gain(.14)
const crash = s("<cr ~!7>").bank("RolandTR909").hpf(3000).room(.6).gain(.25)

arrange(
  // intro: the pluck alone, nearly closed
  [8,  pluck(chA, 320, 480, 8)],
  [8,  stack(pluck(chA, 480, 650, 8), kick.gain(.4), ticks)],
  // groove: the bass names the chords
  [16, stack(pluck(chA, 650, 1300, 16), kick.gain(.5), hats, ticks, bass(rtA))],
  // build: only the filter builds
  [16, stack(pluck(chA, 1300, 2400, 16), kick.gain(.6), clap, hats, ticks, bass(rtA))],
  // breakdown: drums out, pad and the bell melody; the pluck sinks, then opens for 8 bars
  [16, stack(pluck(chA, 1500, 700, 16, .3).gain(.4), pad(chA), bell)],
  [8,  stack(pluck(chA, 700, 3200, 8, .26), pad(chA), bell, sub(rtA), ticks.gain(saw.range(.03, .16).slow(8)))],
  // drop: everything, the melody on the lead
  [32, stack(pluck(chA, 3200, 3800, 32, .23), kick, clap, hats, open, ticks, ride, crash, bass(rtA), pad(chA), lead)],
  // lift: B chords, melody rests, the top voice of the chords climbs instead
  [16, stack(pluck(chB, 2600, 4200, 16, .25), kick, clap, hats, open, ticks, crash, bass(rtB), pad(chB))],
  // return: home chords, bell and lead together
  [16, stack(pluck(chA, 4200, 3400, 16, .23), kick, clap, hats, open, ticks, ride, crash, bass(rtA), pad(chA), lead, bell.gain(.26))],
  // outro: strip back to where it began
  [8,  stack(pluck(chA, 3400, 1200, 8), kick, hats, ticks, bass(rtA))],
  [8,  stack(pluck(chA, 1200, 320, 8), kick.mask("<1!4 0!4>"), ticks.mask("<1!6 0!2>"))],
)
