// 12 (untitled) · deadmau5 x John Summit, 128 BPM, E minor
// Restart (2026-11-21): the synths alone first, as with Slow Light. The synths carry the emotion; drums and bass wait.
// From Joona's brief: the detuned saw pluck, patience, chords borrowed from the parallel major for a bittersweet lift.
// (Scrapped today: a Summit bass loop, a Ganacci bounce, and a first mau5 x Summit sketch.)
// @q 4
setcpm(128/4)

// ---- harmony: 16 bars, voiced so the top note barely moves ----
// first half:  Em9 · Cmaj9 · Gmaj9 · D/F#              (home)
// second half: E major add9 · Cmaj9 · Am9 · Bsus4 -> B7 (the E MAJOR is borrowed from E major: the bittersweet lift;
//              G# against the G of the first half is the whole emotion. B7 leads home to Em)
const chords = note(`<
  [e3,g3,b3,d4,fs4]!2   [c3,g3,b3,d4,e4]!2   [d3,g3,b3,d4,fs4]!2   [fs3,a3,d4,e4,fs4]!2
  [e3,gs3,b3,e4,fs4]!2  [c3,g3,b3,d4,e4]!2   [a3,c4,e4,g4,b4]!2    [b3,e4,fs4,a4] [b3,ds4,fs4,a4]>`)

// ---- 1. the mau5 pluck: arpeggiated through each chord, two detuned saws, resonant ladder filter ----
// Each note's filter snaps shut (lpenv + short lpdecay): the pluck. The base cutoff opens and closes over 32 bars.
// Two arp shapes alternate every 2 bars so the line keeps changing; the gains pump like a sidechain with no kick.
const arpShape = `<
  [0 1 2 3 4 3 2 1 0 1 2 3 4 3 2 1]
  [0 2 4 2 1 3 4 3 0 2 4 3 1 2 4 2]>`
const pluck = chords.arp(arpShape)
  .s("sawtooth").unison(2).detune(.12)
  .lpf(sine.range(500, 2300).slow(32)).lpq(8).ftype("ladder")
  .lpattack(.001).lpenv(4).lpdecay(.12).lpsustain(0)
  .attack(.001).decay(.22).sustain(0).release(.05)
  .gain("[.75 .42 .58 .42]*4")
  .delay(.35).delaytime(3/16).delayfeedback(.45)
  .pan("[.32 .68]*8").room(.3).size(.6).orbit(2)

// a glassy square an octave up, only on the downbeats of each 4: the sparkle on top of the pluck
const glass = chords.arp(arpShape).add(note(12)).struct("[x ~ ~ ~]*4")
  .s("square").lpf(3200).attack(.001).decay(.09).sustain(0).release(.04)
  .gain(.11).delay(.4).delaytime(3/8).delayfeedback(.35).room(.4).orbit(2)

// ---- 2. the pad: five detuned saws, slow swell, filter rising across the 16 bars, big room ----
const pad = chords.s("sawtooth").unison(5).detune(.28)
  .attack(.7).decay(.4).sustain(.8).release(1.6)
  .lpf(saw.range(600, 2600).slow(16)).lpq(1)
  .gain(.16).room(.85).size(.95).orbit(5)

stack(pluck, glass, pad)
