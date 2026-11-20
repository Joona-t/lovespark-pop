// 11 "Night Shift" · deadmau5 x kaskade progressive house, 128 BPM, A minor, 96 bars (~3:00)
// Cooked live 2026-11-20. Mau5 rules: few layers at full fidelity, low end owned by kick + bass only,
// the pluck opens over 32 bars instead of a riser, micro-automation every few bars, every phrase resolves G6 -> Am9.
// Sections: intro 16 · journey 32 · breakdown 16 · drop 24 · outro 8
// @q 4
// @keep
setcpm(128/4)

const prog = "<Am9 Fmaj9 C^7 G6>", roots = "<a1 f1 c2 g1>"

// low end: kick and bass only below 180 Hz; the kick ducks the music bus (orbit 2)
const kick = s("bd*4").bank("RolandTR909").shape(.15).gain(1)
  .orbit(9).duckorbit(2).duckattack(.25).duckdepth(.85)
const bass = note(roots).struct("[~ x]*4").s("sawtooth")
  .lpf(420).lpq(3).decay(.22).sustain(.15).release(.04).gain(.62).orbit(2)

// tops, high-passed out of the low end
const clap = s("~ cp ~ cp").bank("RolandTR909").hpf(300).room(.3).gain(.45)
const hats = s("[~ hh]*4").bank("RolandTR909").hpf(5000).gain(.38)
const ride = s("rd*4").bank("RolandTR909").hpf(6000).gain(.16)

// the mau5 pluck, custom patch: three oscillators through one resonant filter envelope
//   A  detuned saw stack (the body)      B  square an octave up (the glassy top)
//   C  FM sine, short metallic blip on the attack (the "tick" that cuts through)
// shared: 4-stage-ish snap (lpenv 4, 120 ms decay, q 9), tiny pitch dip on the attack, slow vibrato drift like an old analog
// 3-3-2 syncopation, dotted-eighth delay. lo..hi is where the cutoff starts and ends; bars is how slowly it opens.
const stab = "x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ x ~"
const pluckVoice = (osc) => chord(prog).voicing().struct(stab).layer(osc)
const pluck = (lo, hi, bars) => stack(
    pluckVoice(x => x.s("supersaw").unison(3).detune(.18).gain(.4)),
    pluckVoice(x => x.add(note(12)).s("square").gain(.12)),
    pluckVoice(x => x.add(note(12)).s("sine").fm(3).fmh(3.01).fmdecay(.05).fmsustain(0).gain(.08)),
  )
  .hpf(220).lpf(saw.range(lo, hi).slow(bars)).lpattack(.002).lpenv(4).lpdecay(.12).lpsustain(0).lpq(9)
  .penv(-.3).pdecay(.03).vib(4.5).vibmod(.05).shape(.12)
  .attack(.002).decay(.24).sustain(0).release(.05)
  .delay(.3).delaytime(3/16).delayfeedback(.4)
  .room(saw.range(.25, .45).slow(bars)).pan(sine.range(.4, .6).slow(16))
  .gain(1).orbit(2)

// Kaskade warmth: one wide pad, enters late, quiet
const pad = chord(prog).voicing().s("supersaw").detune(.45).unison(5)
  .attack(.6).release(1.8).hpf(250).lpf(1500).room(.8).size(.9).gain(.15).orbit(2)

// top line for the drop in A minor, lands on the root every 4 bars
const lead = n("<[4 ~ 2 ~ 4 ~ 7 ~] [6 ~ 4 ~ 2 ~ ~ ~] [4 ~ 2 ~ 4 ~ 9 7] [~ 6 4 2 0 ~ ~ ~]>")
  .scale("A3:minor").s("square").hpf(400).lpf(2600).lpenv(2).lpdecay(.2)
  .decay(.25).sustain(.25).release(.15).delay(.3).delaytime(3/16).room(.5).gain(.22).orbit(2)

arrange(
  [16, stack(kick, hats.gain(.25), pluck(300, 700, 16))],
  [32, stack(kick, bass, clap, hats, pluck(700, 2600, 32))],
  [16, stack(pluck(900, 1800, 16).delayfeedback(.55), pad.gain(.22), hats.gain(.15))],
  [24, stack(kick, bass, clap, hats, ride, pluck(2600, 3400, 24), pad, lead)],
  [8,  stack(kick, hats, pluck(2000, 400, 8))],
)
