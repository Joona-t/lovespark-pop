// 12 "Aura (Festival Version)" · Bvby Ash · deadmau5 x John Summit, 128 BPM, E minor, 138 bars (~4:19)
// The name is Joona's word for the opening: "this aura of airy emotional resonance".
// Restart (2026-11-21): the synths first, as with Slow Light. Joona on the synths: "this is it".
// Arrangement (his call): open airy and ethereal on the synths alone for a minute, then layer the drums in as the energy rises.
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
const pluckBright = (lo, hi) => chords.arp(arpShape)
  .s("sawtooth").unison(2).detune(.12)
  .lpf(saw.range(lo, hi).slow(16)).lpq(8).ftype("ladder")
  .lpattack(.001).lpenv(4).lpdecay(.12).lpsustain(0)
  .attack(.001).decay(.22).sustain(0).release(.05)
  .gain("[.75 .42 .58 .42]*4")
  .delay(.35).delaytime(3/16).delayfeedback(.45)
  .pan("[.32 .68]*8").room(.3).size(.6).orbit(2)

// layered arps (Joona, 2026-11-21: "i like a but try layering the arps"): version B's arp under A's, an octave lower,
// three wider saws, resonance near whistling, a long wet echo, panned wider; A's bright arp stays on top
const pluckDeep = (lo, hi) => chords.arp(arpShape).add(note(-12))
  .s("sawtooth").unison(3).detune(.22)
  .lpf(saw.range(lo * .6, hi * .6).slow(16)).lpq(14).ftype("ladder")
  .lpattack(.002).lpenv(3).lpdecay(.18).lpsustain(.15)
  .attack(.002).decay(.32).sustain(.08).release(.12)
  .gain("[.8 .48 .62 .48]*4")
  .delay(.55).delaytime(3/16).delayfeedback(.62)
  .pan("[.2 .8]*8").room(.45).size(.8).orbit(2)
const pluck = (lo, hi) => stack(pluckBright(lo, hi), pluckDeep(lo, hi).velocity(.95))

// a glassy square an octave up, only on the downbeats of each 4: the sparkle on top of the pluck
const glass = chords.arp(arpShape).add(note(12)).struct("[x ~ ~ ~]*4")
  .s("square").lpf(3200).attack(.001).decay(.09).sustain(0).release(.04)
  .gain(.11).delay(.4).delaytime(3/8).delayfeedback(.35).room(.4).orbit(2)

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
  .orbit(9).duckorbit("2:3:4:5:6").duckattack(.2).duckdepth(.7)

// ---- drums, layer 2: Summit's groove. Clap on 2 and 4, shuffled 16th hats, open hat on every off-beat ----
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.22).size(.4).gain(.5).orbit(1)
// on the kick only (Joona: "instead of having the hi-hat hit constantly, which sounds super odd, just have it hit with the kick")
const hats = s("hh*4").bank("RolandTR909").gain(.16).hpf(8000).decay(.05).orbit(1)
const open = s("[~ oh]*4").bank("RolandTR909").decay(.2).gain(.3).hpf(5000).orbit(1)   // not used: removed from every section (Joona, after previews 7a/7b: "7b, no open hat")

// ---- drums, layer 3: percussion that never repeats inside 4 bars, and a crash at the top of each 16 ----
const rim = silence   // removed (Joona, after previews: "1 is the best, the rim is out of place")
const shaker = silence   // removed with the constant hats: it was a second hi-hat ticking on every 16th
const tom = silence   // removed with the rim: preview 1 had neither
const crash = s("<cr ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>").bank("RolandTR909").gain(.26).room(.4).orbit(1)

// ---- build: a snare roll that doubles every 2 bars and a white-noise riser, both rising over 8 bars ----
const roll = s("sd*<4 4 8 8 16 16 [16 32] 32>").bank("RolandTR909")
  .gain(saw.range(.1, .55).slow(8)).hpf(saw.range(200, 1200).slow(8)).room(.3).orbit(1)
const riser = s("white*16").decay(.07).sustain(0)
  .lpf(saw.range(400, 9000).slow(8)).hpf(300).gain(saw.range(0, .22).slow(8)).pan(sine.range(.3, .7).fast(4)).orbit(1)

// ---- the outro's air: a halo of the chords an octave up that swells slowly, and the arp opening with no acid resonance ----
const halo = chords.add(note(12)).s("triangle").attack(1.6).decay(.5).sustain(.8).release(3)
  .gain(.06).lpf(5000).room(.9).size(.98).pan(sine.range(.3, .7).slow(8)).orbit(5)
const airPluck = pluckBright(3000, 4200).lpq(3).gain(.55).delayfeedback(.55).room(.7).size(.95).velocity(saw.range(.85, .2).slow(16))   // even gain: the beat accent read as a pulse once the bell was gone

// ---- John Summit (Joona, 2026-11-21: "also try make it more john summit like"): the drop is led by the bass and a vocal hook ----
// a vocal chop: a saw through a formant filter, syncopated off the kick, on the chord tones; Summit's hooks are voices, not leads
const chopNotes = note("<b4!2 g4!2 b4!2 a4!2 b4!2 g4!2 c5!2 b4!2>")
const chop = chopNotes.struct("<[~ ~ x ~ ~ x ~ ~ x ~ ~ ~ x ~ ~ ~] [~ ~ x ~ ~ x ~ ~ ~ ~ x ~ ~ x ~ ~]>")
  .s("sawtooth").vowel("<a o e o>").attack(.004).decay(.14).sustain(0).release(.06).lpf(3200)
  .gain(.3).delay(.25).delaytime(3/16).delayfeedback(.3).room(.3).orbit(6)
// a snare under the clap on 2 and 4: the crack of a tech-house backbeat (no new ticking: it lands with the clap)
const snap = s("~ sd ~ sd").bank("RolandTR909").gain(.2).hpf(350).decay(.12).orbit(1)
// the drop bass: the rolling line opened up and driven harder, so the bass is the lead
const summitBass = bass(1150, .6)

// the build (Joona: "dont do the hihat classic build up be unique", "research what john summit does"). No snare roll, no noise riser.
// Summit lets the vocal lead and keeps the drop to "just a kick in bass" (GRAMMY, 2024), so the build takes the kick and the low end away:
// the rolling bassline plays alone, thin (high-passed) with its filter climbing over 8 bars; the vocal hook answers with longer and
// longer echoes; in the last bar everything stops but one hook stab thrown into the echo, and the drop lands kick, sub and all
const buildBass = bass(saw.range(250, 1150).slow(8), .55).hpf(260).mask("<1!7 0>")
const buildChop = chop.gain(saw.range(.14, .32).slow(8)).delayfeedback(saw.range(.3, .62).slow(8)).mask("<1!7 0>")
const throwChop = note("b4").struct("<~!7 [x ~ ~ ~]>").s("sawtooth").vowel("o").attack(.004).decay(.25).sustain(0).release(.1)
  .lpf(3200).gain(.34).delay(.6).delaytime(3/16).delayfeedback(.7).room(.5).size(.9).orbit(6)
const build = stack(buildBass, buildChop, throwChop, stack(pad, soft, pluck(900, 4200)).mask("<1!7 0>"))

// ---- FESTIVAL VERSION (Joona, 2026-11-21: "1 more version that i would play at a festival with john summit and deadmau5
// performing ... you lead"). The album version is patience; this one is a set piece: a short intro, a hands-in-the-air breakdown
// where the bell, the low bell and the soft synth sing together with no drums, and TWO different drops (Summit built two for his
// festival remix of "I Remember"): drop 1 is his, bass and vocal hook; drop 2 is both of them at once, a 303 line and
// offbeat supersaw stabs under the full melody. No hi-hat rolls, no shaker, hats only on the kick, as in the album version ----

// offbeat supersaw stabs of the chords: with the sidechain they are the pump of a big room
const stabs = chords.struct("[~ x]*4").s("sawtooth").unison(5).detune(.3)
  .lpf(saw.range(1800, 3600).slow(16)).attack(.004).decay(.15).sustain(0).release(.06)
  .gain(.34).room(.45).size(.8).pan("[.3 .7]*2").orbit(5)

// a 303 line (Summit's Dimension EP leans on acid): 16ths on the root with octave jumps, the filter climbing across the drop.
// Kept under the melody and with less resonance than a classic 303 (Joona found the old ending "buzzy ... acidy")
const acid = roots.add(note("[12 12 24 12 12 24 12 19 12 12 24 12 24 12 19 12]"))
  .struct("[x x ~ x x ~ x x x ~ x x ~ x x ~]")
  .s("sawtooth").lpf(saw.range(500, 2600).slow(16)).lpq(9).ftype("ladder")
  .lpattack(.001).lpenv(3).lpdecay(.09).lpsustain(0).attack(.001).decay(.11).sustain(0).release(.02)
  .shape(.3).gain(.46).delay(.2).delaytime(3/16).delayfeedback(.3).pan(sine.range(.35, .65).slow(4)).orbit(6)

// the kick for the second drop: the same 909, the synths ducking deeper under it
const bigKick = kick.duckdepth(.85)
// breakdown II ends like the build: one hook stab thrown into a long echo over a bar of nothing
const hold = (p) => stack(p.mask("<1!7 0>"), throwChop)
const outroPluck = pluckBright(3000, 4200).lpq(3).gain(.55).delayfeedback(.55).room(.7).size(.95).velocity(saw.range(.85, .2).slow(24))

// ---- the arrangement: 138 bars (~4:19) ----
arrange(
  [8, stack(pad, glass.gain(.07), pluckBright(300, 900).gain(.6))],   // air: the first version's opening, half as long
  [8, stack(drone, bell, pad, glass, pluckBright(900, 1600))],   // bloom: the melody as a far bell
  [8, stack(kick.gain(.5), bass(300, .22), bell, pad, glass, pluckBright(1600, 2000))],   // pulse: the kick arrives early, this is a set
  [16, stack(kick, clap, hats, crash, bass(520, .4), soft, bell, pad, glass, pluck(1900, 2600))],   // groove: both arps, at full weight from its first bar
  [16, stack(drone, all3, halo, pad, glass, pluckBright(1200, 2400).mask("<1!8 0!8>"), pluck(2000, 3000).mask("<0!8 1!8>"))],   // breakdown: no drums; bell, low bell and soft synth together; the bright arp alone, then both
  [8, build],   // build: the filtered bassline and the hook climb, one bar of thrown echo
  [16, stack(kick, clap, snap, hats, crash, summitBass, all3.velocity(.8), chop, pad, glass, pluck(3200, 4200))],   // drop 1 (Summit): the bass and the vocal hook lead
  [8, hold(stack(drone, soft, bellLow, pad.gain(.2), stabs.gain(.14), pluckDeep(1600, 2800)))],   // breakdown II: the deep arp alone, the stabs far away, then one thrown stab
  [16, stack(bigKick, clap, snap, hats, crash, summitBass, acid, stabs, all3, chop, pad, glass, pluck(3600, 4400))],   // drop 2 (both of them): 303 and supersaw stabs under the full melody
  [8, stack(bigKick, clap, snap, hats, crash, summitBass, acid.lpf(2800), stabs.lpf(4200), all3, bell.add(note(12)).gain(.12), pad, glass, pluck(4200, 4600))],   // peak: the bell an octave up over everything, the hook steps out
  [24, stack(kick.gain(.4).duckdepth(.25).mask("<1!8 0!16>"), bass(300, 0).mask("<1!8 0!16>"), halo,
             soft.velocity(saw.range(1, .25).slow(24)), pad.lpf(2000), outroPluck)],   // outro: the ground falls away after 8 bars, 16 bars of floating on the soft synth
  [2, silence],   // ring-out: the echoes and reverb finish
)
