// 12 "Aura" (version B: deeper, resonant, echoey arp) · Bvby Ash · deadmau5 x John Summit, 128 BPM, E minor, 152 bars (~4:45)
// The name is Joona's word for the opening: "this aura of airy emotional resonance".
// Restart (2026-11-21): the synths first, as with Slow Light. Joona on the synths: "this is it".
// Arrangement (his call): open airy and ethereal on the synths alone for a minute, then layer the drums in as the energy rises.
// Sections, 152 bars (~4:45): air 16 · bloom 16 · pulse 16 · groove 16 · full 16 · breakdown 16 · build 8 · drop 32 · outro 16
// From Joona's brief: the detuned saw pluck, patience, chords borrowed from the parallel major for a bittersweet lift.
// (Scrapped today: a Summit bass loop, a Ganacci bounce, and a first mau5 x Summit sketch.)
// @q 4
// @top
setcpm(128/4)

// ---- harmony: 16 bars, voiced so the top note barely moves ----
// first half:  Em9 · Cmaj9 · Gmaj9 · D/F#              (home)
// second half: E major add9 · Cmaj9 · Am9 · Bsus4 -> B7 (the E MAJOR is borrowed from E major: the bittersweet lift;
//              G# against the G of the first half is the whole emotion. B7 leads home to Em)
const chords = note(`<
  [e3,g3,b3,d4,fs4]!2   [c3,g3,b3,d4,e4]!2   [d3,g3,b3,d4,fs4]!2   [fs3,a3,d4,e4,fs4]!2
  [e3,gs3,b3,e4,fs4]!2  [c3,g3,b3,d4,e4]!2   [a3,c4,e4,g4,b4]!2    [b3,e4,fs4,a4] [b3,ds4,fs4,a4]>`)

// ---- 1. the mau5 pluck: arpeggiated through each chord, two detuned saws, resonant ladder filter ----
// Each note's filter snaps shut (lpenv + short lpdecay): the pluck. The base cutoff opens section by section.
// Two arp shapes alternate every 2 bars so the line keeps changing; the gains pump like a sidechain with no kick.
const arpShape = `<
  [0 1 2 3 4 3 2 1 0 1 2 3 4 3 2 1]
  [0 2 4 2 1 3 4 3 0 2 4 3 1 2 4 2]>`
// lo..hi: the cutoff at the start and end of a 16-bar section
// Version B (Joona: "more synth like and echoey and resonant ... too high pitched"): an octave lower, three wider saws,
// resonance near whistling, the filter capped at 60% of version A, longer notes, a long wet ping-pong echo
const pluck = (lo, hi) => chords.arp(arpShape).add(note(-12))
  .s("sawtooth").unison(3).detune(.22)
  .lpf(saw.range(lo * .6, hi * .6).slow(16)).lpq(14).ftype("ladder")
  .lpattack(.002).lpenv(3).lpdecay(.18).lpsustain(.15)
  .attack(.002).decay(.32).sustain(.08).release(.12)
  .gain("[.8 .48 .62 .48]*4")
  .delay(.55).delaytime(3/16).delayfeedback(.62)
  .pan("[.2 .8]*8").room(.45).size(.8).orbit(2)

// a glassy square an octave up, only on the downbeats of each 4: the sparkle on top of the pluck
const glass = chords.arp(arpShape).struct("[x ~ ~ ~]*4")    // B: at the chord register, not an octave up
  .s("square").lpf(3200).attack(.001).decay(.09).sustain(0).release(.04)
  .gain(.09).delay(.4).delaytime(3/8).delayfeedback(.35).room(.4).orbit(2)

// ---- 2. the pad: five detuned saws, slow swell, filter rising across the 16 bars, big room ----
const pad = chords.s("sawtooth").unison(5).detune(.28)
  .attack(.7).decay(.4).sustain(.8).release(1.6)
  .lpf(saw.range(600, 2600).slow(16)).lpq(1)
  .gain(.16).room(.85).size(.95).orbit(5)

// ---- the melody: 16 bars, every long note a chord tone, 3-3-2 phrasing ----
// bars 1-8 ask and come to rest on F# over D/F#; bars 9-16 answer: G# over the borrowed E major is the high point,
// then G natural over C (the bittersweet turn back to minor), and D# over B7 pulls home to the E at bar 1
const tune = note(`<
  [b4 ~ ~ fs5 ~ ~ e5 ~]   [d5 ~ ~ ~ ~ ~ e5 fs5]
  [g5 ~ ~ e5 ~ ~ d5 ~]    [e5 ~ ~ ~ ~ ~ ~ ~]
  [d5 ~ ~ b4 ~ ~ d5 ~]    [fs5 ~ ~ ~ g5 ~ fs5 ~]
  [e5 ~ ~ d5 ~ ~ a4 ~]    [fs4 ~ ~ ~ ~ ~ ~ ~]
  [gs5 ~ ~ fs5 ~ ~ e5 ~]  [b5 ~ ~ ~ gs5 ~ ~ ~]
  [g5 ~ ~ e5 ~ ~ b4 ~]    [d5 ~ ~ ~ e5 ~ ~ ~]
  [c5 ~ ~ e5 ~ ~ a5 ~]    [g5 ~ ~ ~ e5 ~ b4 ~]
  [a4 ~ ~ b4 ~ ~ e5 ~]    [ds5 ~ ~ ~ fs5 ~ ~ ~]>`)

// bloom: the melody as a soft FM bell, far away in a big room, the first time you hear it
const bell = tune.s("sine").fm(2).fmh(3.01).fmdecay(.6).fmsustain(.1)
  .attack(.005).decay(1.1).sustain(0).release(.8)
  .gain(.2).delay(.45).delaytime(3/8).delayfeedback(.5).room(.8).size(.95).pan(.55).orbit(4)

// the bell an octave down: rounder and closer, like a vibraphone
const bellLow = bell.add(note(-12)).gain(.24)

// the soft synth: triangle + a filtered square an octave below the bell, slow vibrato, long echo
const soft = stack(
  tune.add(note(-12)).s("triangle").gain(.32),
  tune.add(note(-12)).s("square").lpf(1400).gain(.07)
).attack(.03).decay(.6).sustain(.5).release(.6).vib(4).vibmod(.1)
  .delay(.5).delaytime(3/16).delayfeedback(.55).room(.6).size(.9).orbit(4)

// Joona (2026-11-21), after auditioning six voices live: these three, layered at different times, then all together,
// and the song closes on the soft synth alone
const all3 = stack(bell, bellLow, soft)

// ---- the bass: follows every chord. Roots under the slash chord D/F# take the F# ----
const roots = note("<e1!2 c2!2 g1!2 fs1!2 e1!2 c2!2 a1!2 b1!2>")
const uppers = note("<b1!2 g1!2 d2!2 a1!2 b1!2 g1!2 e2!2 fs2!2>")    // a chord tone above each root (the 5th; A over F#)

// bloom: one long sine root per bar, swelling in, the warmth under the air
const drone = roots.s("sine").attack(1.2).decay(.5).sustain(.7).release(2).lpf(220).gain(.32).orbit(3)

// Summit's rolling line: 16ths off the kick, root notes, a chord tone and an octave as the fills.
// Two bars of rhythm alternate so the fill changes every bar.
const rolling = stack(
  roots.struct("[~ x ~ x ~ ~ x ~ ~ x ~ ~ ~ x ~ ~]"),
  uppers.struct("<[~ ~ ~ ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ x] [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ x x ~ ~ ~ ~]>"),
  roots.add(note(12)).struct("<[~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ x x]>"))
// a clean sine for the weight, a driven saw an octave up for the note you hear on small speakers
const bass = (cut = 380, bite = .36) => stack(
  rolling.s("sine").attack(.002).decay(.16).sustain(0).release(.03).gain(.8),
  rolling.add(note(12)).s("sawtooth")
    .lpf(cut).lpq(5).ftype("ladder").lpattack(.001).lpenv(3).lpdecay(.07).lpsustain(0)
    .attack(.001).decay(.13).sustain(0).release(.03).shape(.35).gain(bite)).orbit(3)

// ---- drums, layer 1: the kick. 909, four on the floor, ducks the pluck and the pad so the synths breathe with it ----
const kick = s("bd*4").bank("RolandTR909").shape(.2).gain(.62)
  .orbit(9).duckorbit("2:3:4:5").duckattack(.2).duckdepth(.7)

// ---- drums, layer 2: Summit's groove. Clap on 2 and 4, shuffled 16th hats, open hat on every off-beat ----
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.22).size(.4).gain(.5).orbit(1)
// on the kick only (Joona: "instead of having the hi-hat hit constantly, which sounds super odd, just have it hit with the kick")
const hats = s("hh*4").bank("RolandTR909").gain(.16).hpf(8000).decay(.05).orbit(1)
const open = s("[~ oh]*4").bank("RolandTR909").decay(.2).gain(.3).hpf(5000).orbit(1)

// ---- drums, layer 3: percussion that never repeats inside 4 bars, and a crash at the top of each 16 ----
const rim = s(`<[~ ~ rim ~ ~ rim ~ ~ ~ ~ rim ~ ~ ~ ~ rim] [~ ~ rim ~ ~ ~ ~ rim ~ ~ rim ~ ~ rim ~ ~]
              [~ ~ rim ~ ~ rim ~ ~ ~ rim ~ ~ ~ ~ rim ~] [~ ~ rim ~ rim ~ ~ rim ~ ~ rim ~ rim ~ rim rim]>`)
  .bank("RolandTR909").gain(.22).pan(.62).delay(.2).delaytime(3/16).delayfeedback(.25).orbit(1)
const shaker = silence   // removed with the constant hats: it was a second hi-hat ticking on every 16th
const tom = s("<~ ~ ~ [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ lt ~ mt ~ ht ht]>").bank("RolandTR909").gain(.3).room(.3).orbit(1)
const crash = s("<cr ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>").bank("RolandTR909").gain(.26).room(.4).orbit(1)

// ---- build: a snare roll that doubles every 2 bars and a white-noise riser, both rising over 8 bars ----
const roll = s("sd*<4 4 8 8 16 16 [16 32] 32>").bank("RolandTR909")
  .gain(saw.range(.1, .55).slow(8)).hpf(saw.range(200, 1200).slow(8)).room(.3).orbit(1)
const riser = s("white*16").decay(.07).sustain(0)
  .lpf(saw.range(400, 9000).slow(8)).hpf(300).gain(saw.range(0, .22).slow(8)).pan(sine.range(.3, .7).fast(4)).orbit(1)

// ---- the arrangement: 152 bars. The synths hold the room alone, then the drums arrive one by one ----
arrange(
  [16, stack(pad, glass.gain(.07), pluck(300, 700).gain(.6))],   // air: pad, a whisper of pluck, no melody yet
  [16, stack(drone, bell, pad, glass, pluck(700, 1400))],   // bloom: the melody arrives as a far bell, still no drums
  [16, stack(kick.gain(.42), shaker, bass(260, .18), bellLow, pad, glass, pluck(1400, 1900))],   // pulse: soft kick, shaker, quiet bass; the bell an octave down
  [16, stack(kick.gain(.54), clap, hats, rim, tom, bass(), soft, bell, pad, glass, pluck(1900, 2400))],   // groove: the soft synth joins the bell
  [16, stack(kick, clap, hats, open, rim, shaker, tom, crash, bass(520, .42), all3, pad, glass, pluck(2400, 3000))],   // full: all three voices together
  [16, stack(drone, soft, bellLow, pad.gain(.2), glass, pluck(2600, 800))],   // breakdown: drums out; soft synth and the low bell, close and intimate
  [8, stack(roll, riser, pad, glass, soft, pluck(900, 4200)).mask("<1!7 [1 0]>")],   // build: the soft synth alone over the roll, then half a bar of silence
  [16, stack(kick, clap, hats, open, rim, shaker, tom, crash, bass(650, .46), all3, pad, glass, pluck(3200, 3800))],   // drop: all three, brightest
  [16, stack(kick, clap, hats, open, rim, shaker, tom, crash, bass(650, .46), all3, pad, glass, pluck(3800, 4400))],   // drop II: all three, the pluck opens once more
  [16, stack(kick.gain(.5), hats.gain(.7), shaker, bass(380, .28), soft.velocity(saw.range(1, .15).slow(16)), pad, glass, pluck(2400, 300))],   // outro: only the soft synth, fading with the pluck back to air
)
