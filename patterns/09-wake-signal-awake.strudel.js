// 09 "Wake Signal (Awake Mix)" · 126 BPM, F minor, 120 bars (~3:49) · vocals: Rose (our own Qwen3-TTS voice)
// Cooked live 2026-11-19. intro 16 · build 8 · A 16 · break 8 · drop 16 · B 16 · half-time bridge 8 · final drop 16 · outro 16
setcpm(126/4)
// vocal packs: run tools/live/server.py (serves samples/ locally)
samples({
  vox_wakeup: ['wake_up_s7.wav', 'wake_up_s21.wav'], vox_signal: ['signal_s7.wav', 'signal_s21.wav'],
  vox_hearme: ['hear_me_s7.wav', 'hear_me_s21.wav'], vox_awake: ['awake_now_s7.wav', 'awake_now_s21.wav'],
  vox_higher: ['higher_s7.wav', 'higher_s21.wav'], vox_oh: ['oh_s7.wav', 'oh_s21.wav'],
  vox_ah: ['ah_s7.wav', 'ah_s21.wav'], vox_hey: ['hey_s7.wav', 'hey_s21.wav'],
  vox_follow: ['follow_s7.wav', 'follow_s21.wav'], vox_dontsleep: ['dont_sleep_s7.wav', 'dont_sleep_s21.wav'],
}, 'http://localhost:4321/samples/vox/')
// the sung line, hard-tuned to F minor by tools/sing.py
samples(Object.fromEntries(['ivebeen', 'waiting', 'forthis', 'forsucha', 'long', 'time', 'forallof', 'my', 'life']
  .map(n => ['sing_' + n, ['sing_' + n + '.wav']])), 'http://localhost:4321/samples/sing/')

const A = "<Fm9 Db^7 Ab^7 Eb>", Aroots = "<f1 db1 ab0 eb1>"
const B = "<Db^7 Eb Fm9 Cm7 Db^7 Eb Ab^7 C7>", Broots = "<db1 eb1 f1 c1 db1 eb1 ab0 c1>"

// drums (orbit 1); the kick ducks the music bus (orbit 2) like a sidechain compressor
const kick = s("bd*4").bank("RolandTR909").shape(.25).mask("<1!7 [1 1 1 0]>").gain(1.05)
  .duckorbit(2).duckattack(.18).duckdepth(.85)
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.25).gain(.6)
const fill = s("<~!7 [~ ~ cp*4 cp*8]>").bank("RolandTR909").gain(.5)
const hats = s("hh*8").bank("RolandTR909").swingBy(1/6, 4).gain("[.25 .5]*4")
const open = s("[~ oh]*4").bank("RolandTR909").gain(.35)
const rim = s("~ ~ ~ ~ ~ ~ ~ rim").bank("RolandTR909").gain(.4)
const drums = stack(kick, clap, fill, hats, open)
const halfTime = stack(
  s("bd ~ ~ ~ ~ ~ ~ [~ bd]").bank("RolandTR909").shape(.25).gain(1.05).duckorbit(2).duckattack(.3).duckdepth(.7),
  s("~ ~ ~ ~ cp ~ ~ ~").bank("RolandTR909").room(.5).gain(.7),
  s("hh*4").bank("RolandTR909").gain(.25))
const riser = s("white*16").decay(.08).sustain(0)
  .lpf(saw.range(400, 9000).slow(8)).gain(saw.range(0, .28).slow(8))
const roll = s("sd*<4 4 8 8 16 16 [16 32] 32>").bank("RolandTR909").gain(saw.range(.15, .7).slow(8))

// music bus (orbit 2)
const bass = (roots) => stack(
  note(roots).struct("[~ x x x]*4").s("sawtooth").lpf(500).lpenv(3).lpdecay(.09).lpq(9).decay(.12).sustain(0).gain(.55),
  note(roots).s("sine").gain(.5)).orbit(2)
const sub = (roots) => note(roots).s("sine").gain(.6).orbit(2)
const plucks = (lo, hi) => chord(A).voicing().struct("x*16").s("sawtooth").detune(.25)
  .lpf(700).lpenv(saw.range(lo, hi).slow(8)).lpdecay(.1).lpq(7)
  .decay(.14).sustain(0).room(.4).delay(.2).delaytime(3/16).gain(.55).orbit(2)
const arps = chord(B).voicing().arp("0 1 2 3 4 3 2 1 0 2 4 2 3 1 4 2").s("sawtooth").detune(.2)
  .lpf(900).lpenv(saw.range(2, 5).slow(8)).lpdecay(.12).lpq(6).decay(.16).sustain(0)
  .pan(sine.fast(2).range(.3, .7)).room(.4).delay(.2).delaytime(3/16).gain(.6).orbit(2)
const pad = (ch, lo, hi) => chord(ch).voicing().s("supersaw").unison(5).spread(.8)
  .lpf(saw.range(lo, hi).slow(8)).attack(.1).release(.5).room(.4).gain(.28).orbit(2)

// lead (orbit 3): FM bell, 8-bar question and answer, octave echoes
const bell = (p) => note(p).s("sine").fm(2.5).fmh(3).fmdecay(.18).decay(.3).sustain(.15).release(.2).gain(.42)
  .off(3/16, x => x.add(note(12)).gain(.12))
  .vib(5).vibmod(.08).delay(.3).delaytime(3/8).delayfeedback(.35).room(.4).orbit(3)
const lead = bell(`<
  [c5 ~ ab4 g4 ~ f4 g4 ~] [ab4 ~ ~ f4 ~ c5 ~ ~]
  [eb5 ~ c5 bb4 ~ ab4 bb4 ~] [g4 ~ ~ bb4 ~ ~ ~ ~]
  [c5 ~ ab4 g4 ~ f4 g4 ab4] [c5 ~ ~ f5 ~ eb5 ~ c5]
  [eb5 ~ g5 ~ f5 eb5 c5 ~] [bb4 ~ g4 ~ f4 ~ ~ ~]>`)
const leadB = bell(`<
  ~ [~ ~ ~ ~ ab4 bb4 c5 ~] ~ [~ ~ ~ ~ g4 bb4 eb5 ~]
  ~ [~ ~ ~ ~ bb4 c5 eb5 ~] ~ [g5 ~ f5 ~ e5 ~ c5 ~]>`)
const leadHigh = lead.add(note(12)).gain(.2).pan(.7)

// Rose (orbits 4 and 5)
// "wake up" is out of the arrangement for now (Joona, 2026-11-19); samples and this line kept
const wake = s("<vox_wakeup ~ vox_wakeup:1 ~>").delay(.5).delaytime(3/8).delayfeedback(.5).room(.5).gain(.9).orbit(4)
const chops = s("vox_ah").struct("~ [~ x] ~ [x x] ~ [~ x] [~ x] ~").begin(.08).clip(.45)
  .speed("<1 1 1.19 .89>").hpf(400).pan(sine.fast(4).range(.25, .75)).room(.5).gain(.5).orbit(4)
const hey = s("<~ ~ ~ [~ ~ ~ vox_hey]>").speed(1.1).room(.5).gain(.6).orbit(4)
const far = (name) => s(name).hpf(500).room(.8).roomsize(6).delay(.4).delaytime(3/8).delayfeedback(.5).gain(.65).orbit(5)

// The sung line is out of the arrangement (Joona, 2026-11-19: "remove the i have been waiting for this"); samples and this line kept
const sing = s(`<
  [sing_ivebeen sing_waiting sing_forthis@2] ~ [sing_forsucha sing_long] sing_time
  [sing_ivebeen sing_waiting sing_forthis@2] ~ [sing_forallof sing_my] sing_life>`)
  .hpf(300).room(.25).delay(.15).delaytime(3/8).delayfeedback(.3).gain(.5).orbit(6)

arrange(
  [8,  stack(plucks(.5, 2), hats.gain(.3), far("<~ ~ ~ vox_hearme ~ ~ ~ ~>"))],
  [8,  stack(plucks(2, 3.5), hats.gain(.3), rim, far("<~ ~ ~ vox_hearme:1 ~ ~ ~ ~>"))],
  [8,  stack(kick, clap, fill, hats, bass(Aroots), plucks(2.5, 4))],
  [16, stack(drums, bass(Aroots), plucks(3, 4.5), lead, far("<~!7 [~ ~ ~ vox_signal]>"), chops.mask("<0!8 1!8>"))],
  [8,  stack(pad(A, 800, 3000), lead.lpf(1500).gain(.3), riser, roll)],
  [16, stack(drums, bass(Aroots), plucks(4, 4.5), pad(A, 2600, 3400), lead, chops, hey)],
  [16, stack(kick, clap, fill, hats, rim, bass(Broots), arps, pad(B, 1500, 4200), leadB, far("<~ ~ vox_follow ~ ~ ~ vox_follow:1 ~>"))],
  [8,  stack(halfTime, sub(Aroots), pad(A, 600, 5000), lead.lpf(2000).gain(.3), riser)],
  [16, stack(drums, rim, bass(Aroots), plucks(4.5, 5), pad(A, 3000, 4500), lead, leadHigh, chops, hey)],
  [8,  stack(kick, hats, bass(Aroots), plucks(4, 2), far("<vox_signal ~ ~ ~ vox_signal:1 ~ ~ ~>"))],
  [8,  stack(hats.gain(.3), plucks(2, .3), far("<~ ~ ~ ~ ~ ~ vox_awake:1 ~>"))],
)
