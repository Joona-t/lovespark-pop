// 10 "Cyber Space Set" · announcer + crowd over the intro, then "Wake Signal (Awake Mix)" · 126 BPM, 104 bars (~3:20)
// Built 2026-11-19 for the club-set video with Ash and Claudio. Announcer and crowd are our own designed voices.
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
// the vocal: one sultry designed voice, two phrases (single quotes: double-quoted strings become patterns)
samples({ sultry_six: ['sultry__six__s1.wav', 'sultry__six__s2.wav'], sultry_seven: ['sultry__seven__s1.wav', 'sultry__seven__s2.wav'],
  sultry_feelit: ['sultry__feelit__s1.wav', 'sultry__feelit__s2.wav'] }, 'http://localhost:4321/samples/house/')
samples({ br_mcall: ['mcall__s3.wav'], br_crowdmc: ['crowd_mc.wav'] }, 'http://localhost:4321/samples/mc/')   // the announcer in one run-on take, the crowd cut to his length

const A = "<Fm9 Db^7 Ab^7 Eb>", Aroots = "<f1 db1 ab0 eb1>"
const B = "<Db^7 Eb Fm9 Cm7 Db^7 Eb Ab^7 C7>", Broots = "<db1 eb1 f1 c1 db1 eb1 ab0 c1>"

// buses: kick (orbit 9), other drums (1), bass and sub (8), music (2), lead (3), chops (4), distant vocal (5), the line (6), announcer (7).
// The kick ducks the music and bass buses like a sidechain compressor; each bus is captured as a stem for the mix.
const kick = s("bd*4").bank("RolandTR909").shape(.25).mask("<1!7 [1 1 1 0]>").gain(1.05)
  .orbit(9).duckorbit("2:8").duckattack(.18).duckdepth(.85)
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.25).gain(.6)
const fill = s("<~!7 [~ ~ cp*4 cp*8]>").bank("RolandTR909").gain(.5)
// closed hats sit behind the groove: short, high-passed, quiet, off-beat accent (Joona: "sounds like a metronome")
const hats = s("hh*8").bank("RolandTR909").swingBy(1/6, 4).hpf(7500).decay(.04).sustain(0).gain("[.06 .2]*4").pan(.45).room(.12)
const open = s("[~ oh]*4").bank("RolandTR909").gain(.35)
const rim = s("~ ~ ~ ~ ~ ~ ~ rim").bank("RolandTR909").hpf(600).room(.3).gain(.16)
const drums = stack(kick, clap, fill, hats, open)
const halfTime = stack(
  s("bd ~ ~ ~ ~ ~ ~ [~ bd]").bank("RolandTR909").shape(.25).gain(1.05).orbit(9).duckorbit("2:8").duckattack(.3).duckdepth(.7),
  s("~ ~ ~ ~ cp ~ ~ ~").bank("RolandTR909").room(.5).gain(.7),
  s("hh*4").bank("RolandTR909").hpf(7500).decay(.04).sustain(0).gain(.1))
const riser = s("white*16").decay(.08).sustain(0)
  .lpf(saw.range(400, 9000).slow(8)).gain(saw.range(0, .28).slow(8))
const roll = s("sd*<4 4 8 8 16 16 [16 32] 32>").bank("RolandTR909").gain(saw.range(.15, .7).slow(8))

// music bus (orbit 2)
const bass = (roots) => stack(
  note(roots).struct("[~ x x x]*4").s("sawtooth").lpf(420).lpenv(1.3).lpdecay(.1).lpq(2).decay(.14).sustain(0).gain(.6),   // round, not squelchy
  note(roots).s("sine").gain(.5)).orbit(8)
const sub = (roots) => note(roots).s("sine").gain(.6).orbit(8)
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
// "hey" is out of the arrangement (Joona, 2026-11-19: "remove the hey"); sample and line kept
const hey = s("<~!7 [~ ~ ~ vox_hey]>").speed(1.1).room(.5).gain(.6).orbit(4)
const far = (name) => s(name).hpf(500).room(.8).roomsize(6).delay(.4).delaytime(3/8).delayfeedback(.5).gain(.65).orbit(5)

// The sung line is out of the arrangement (Joona, 2026-11-19: "remove the i have been waiting for this"); samples and this line kept
const sing = s(`<
  [sing_ivebeen sing_waiting sing_forthis@2] ~ [sing_forsucha sing_long] sing_time
  [sing_ivebeen sing_waiting sing_forthis@2] ~ [sing_forallof sing_my] sing_life>`)
  .hpf(300).room(.25).delay(.15).delaytime(3/8).delayfeedback(.3).gain(.5).orbit(6)
// "six, seven ... can you feel it": the whole lyric (Joona, 2026-11-19), once every 8 bars (Joona: "too many vocals")
const sixSeven = s("<[sultry_six ~ ~ ~ sultry_seven ~ ~ ~] ~ sultry_feelit ~!13>")   // once per 16 bars: six on 1, seven on 3, a bar of air, then the question (Joona: "appears too often")   // six on 1, seven on 3, a bar of air, then the question
  .room(.3).delay(.25).delaytime(3/8).delayfeedback(.35).gain(.85).orbit(6)

// the announcer in one run-on line over a crowd that is already cheering; the crowd stops when he does, and the song
// is already playing under him (Joona, 2026-11-19)
const announce = stack(
  s("<br_crowdmc ~!7>").gain(.85).orbit(7),
  s("<br_mcall ~!7>").gain(1.15).orbit(7))

arrange(
  // about 3:20 (Joona: "I think the original was like 3 minutes, 19 seconds"): 104 bars at 126 BPM = 3:18 plus the last chord's tail
  [8,  stack(announce, plucks(.6, 2.5))],                                            // the song starts under the announcer
  [8,  stack(kick, plucks(2, 3.8), hats.mask("<0!4 1!4>"))],                          // intro: the kick comes in first, on its own (Joona: "add the kick at like the beginning"), hats after four bars
  [8,  stack(kick, clap, fill, hats, bass(Aroots), plucks(2.5, 4))],                 // build
  [8,  stack(drums, bass(Aroots), plucks(3, 4.5), lead, sixSeven)],                  // A: the line, first time
  [8,  stack(pad(A, 800, 3000), lead.lpf(1500).gain(.3), riser, roll)],              // breakdown
  [16, stack(drums, bass(Aroots), plucks(4, 4.5), pad(A, 2600, 3400), lead, sixSeven, chops.mask("<0!6 1!2>"))],   // drop: the line, second time
  [16, stack(kick, clap, fill, hats, rim, bass(Broots), arps, pad(B, 1500, 4200), leadB)],                           // B: Ash's dance
  [8,  stack(halfTime, sub(Aroots), pad(A, 600, 5000), lead.lpf(2000).gain(.3), riser, far("<~ ~ ~ ~ ~ sultry_feelit:1 ~ ~>"))],   // bridge
  [16, stack(drums, rim, bass(Aroots), plucks(4.5, 5), pad(A, 3000, 4500), lead, leadHigh, sixSeven, chops.mask("<0!6 1!2>"))],   // final drop: third time
  // the ending (Joona: "don't have that stuttering at the end. Just lower it down ... fade out"): the groove simply carries on,
  // steady, while the master fades it out over these 8 bars (tools/mix.py); nothing drops in and out, no last hit
  [8,  stack(kick, clap, hats, bass(Aroots), plucks(4, 2.5), pad(A, 2600, 1800))],
)


