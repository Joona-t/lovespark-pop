// 10 "Cyber Space Set" · announcer + crowd intro (12 bars), then "Wake Signal (Awake Mix)" · 126 BPM, 132 bars (~4:11)
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
samples({ br_mc1: ['mc1__s42.wav'], br_mc2: ['mc2c__s42.wav'], br_crowd: ['crowd.wav'] }, 'http://localhost:4321/samples/mc/')

const A = "<Fm9 Db^7 Ab^7 Eb>", Aroots = "<f1 db1 ab0 eb1>"
const B = "<Db^7 Eb Fm9 Cm7 Db^7 Eb Ab^7 C7>", Broots = "<db1 eb1 f1 c1 db1 eb1 ab0 c1>"

// drums (orbit 1); the kick ducks the music bus (orbit 2) like a sidechain compressor
const kick = s("bd*4").bank("RolandTR909").shape(.25).mask("<1!7 [1 1 1 0]>").gain(1.05)
  .duckorbit(2).duckattack(.18).duckdepth(.85)
const clap = s("~ cp ~ cp").bank("RolandTR909").room(.25).gain(.6)
const fill = s("<~!7 [~ ~ cp*4 cp*8]>").bank("RolandTR909").gain(.5)
const hats = s("hh*8").bank("RolandTR909").swingBy(1/6, 4).gain("[.25 .5]*4").pan(.42)
const open = s("[~ oh]*4").bank("RolandTR909").gain(.33).pan(.57)
const rim = s("~ ~ ~ ~ ~ ~ ~ rim").bank("RolandTR909").gain(.4)
const drums = stack(kick, clap, fill, hats, open)
// variety: a 16th shaker, toms, a one-bar uplifter into every 8th bar line
const shaker = s("hh*16").bank("RolandTR909").hpf(6000).gain("[.1 .18 .13 .24]*4").pan(.64)
const toms = s("~ lt ~ [mt lt] ~ [lt ~] mt ~").bank("RolandTR909").swingBy(1/6, 4).pan("<.3 .7>").gain(.32)
const upl = s("white*16").decay(.07).sustain(0).hpf(900).lpf(saw.range(1200, 9500)).gain(saw.range(0, .2)).mask("<0!7 1>")
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
const SYNC = "x ~ x x ~ x x ~ x ~ x x ~ x ~ x"                                    // a syncopated pluck rhythm, for contrast with straight 16ths
const plucks = (lo, hi, pat = "x*16") => chord(A).voicing().struct(pat).s("sawtooth").detune(.25).hpf(170)
  .lpf(700).lpenv(saw.range(lo, hi).slow(8)).lpdecay(.1).lpq(7)
  .decay(.14).sustain(0).room(.4).delay(.2).delaytime(3/16).gain(.55).orbit(2)
// second-drop switch-up: octave-jumping bass and call-and-response stabs
const rollingBass = (roots) => stack(
  note(roots).struct("[x ~ x x] [~ x ~ x] [x ~ x x] [~ x x ~]").add(note("[0 0 12 0]*4")).s("sawtooth")
    .lpf(520).lpenv(3.2).lpdecay(.09).lpq(10).decay(.12).sustain(0).gain(.55),
  note(roots).s("sine").gain(.5)).orbit(2)
const stabs = chord(A).voicing().struct("<[[~ x] ~ [~ x] ~] [~ ~ [~ x] [x ~]]>").s("square").hpf(220)
  .lpf(2600).decay(.16).sustain(0).room(.4).delay(.25).delaytime(3/16).gain(.3).orbit(2)
const arps = chord(B).voicing().arp("0 1 2 3 4 3 2 1 0 2 4 2 3 1 4 2").s("sawtooth").detune(.2)
  .lpf(900).lpenv(saw.range(2, 5).slow(8)).lpdecay(.12).lpq(6).decay(.16).sustain(0)
  .pan(sine.fast(2).range(.3, .7)).room(.4).delay(.2).delaytime(3/16).gain(.6).orbit(2)
const pad = (ch, lo, hi) => chord(ch).voicing().s("supersaw").unison(5).spread(.8)
  .hpf(200).lpf(saw.range(lo, hi).slow(8)).attack(.1).release(.5).room(.4).gain(.28).orbit(2)

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
// the lead's second form, for the final drop: same opening, then it climbs
const leadVar = bell(`<
  [c5 ~ ab4 g4 ~ f4 g4 ~] [ab4 ~ ~ c5 ~ eb5 ~ ~]
  [f5 ~ eb5 c5 ~ bb4 c5 ~] [eb5 ~ ~ g5 ~ ~ ~ ~]
  [ab5 ~ g5 f5 ~ eb5 f5 g5] [f5 ~ ~ c5 ~ eb5 ~ f5]
  [g5 ~ ab5 ~ g5 f5 eb5 ~] [f5 ~ c5 ~ f4 ~ ~ ~]>`)
const leadHigh = lead.add(note(12)).gain(.18).pan(sine.range(.12, .88).slow(2))        // drifts from ear to ear

// Rose (orbits 4 and 5)
// "wake up" is out of the arrangement for now (Joona, 2026-11-19); samples and this line kept
const wake = s("<vox_wakeup ~ vox_wakeup:1 ~>").delay(.5).delaytime(3/8).delayfeedback(.5).room(.5).gain(.9).orbit(4)
const chops = s("vox_ah").struct("~ [~ x] ~ [x x] ~ [~ x] [~ x] ~").begin(.08).clip(.45)
  .speed("<1 1 1.19 .89>").hpf(400).pan(sine.fast(4).range(.25, .75)).room(.5).gain(.5).orbit(4)
const hey = s("<~!7 [~ ~ ~ vox_hey]>").speed(1.1).room(.5).gain(.6).orbit(4)
const far = (name) => s(name).hpf(500).room(.8).roomsize(6).delay(.4).delaytime(3/8).delayfeedback(.5).gain(.65).orbit(5)

// The sung line is out of the arrangement (Joona, 2026-11-19: "remove the i have been waiting for this"); samples and this line kept
const sing = s(`<
  [sing_ivebeen sing_waiting sing_forthis@2] ~ [sing_forsucha sing_long] sing_time
  [sing_ivebeen sing_waiting sing_forthis@2] ~ [sing_forallof sing_my] sing_life>`)
  .hpf(300).room(.25).delay(.15).delaytime(3/8).delayfeedback(.3).gain(.5).orbit(6)
// "six, seven ... can you feel it": the whole lyric (Joona, 2026-11-19), once every 8 bars (Joona: "too many vocals")
const sixSeven = s("<[sultry_six ~ sultry_seven ~ ~ ~ ~ ~] sultry_feelit ~ ~ ~ ~ ~ ~>")
  .hpf(140).room(.3).delay(.25).delaytime(3/8).delayfeedback(.35).gain(.85).orbit(6)

// the announcer over a cheering crowd; the set starts on bar 13
const announce = stack(
  s("<br_crowd ~ ~ ~ ~ ~ br_crowd ~ ~ ~ ~ ~>").gain(.9).orbit(7),
  s("<br_mc1 ~ ~ ~ ~ br_mc2 ~ ~ ~ ~ ~ ~>").gain(1.1).orbit(7),
  plucks(.3, 1.2).gain(.3),
  riser.early(4).mask("<0!8 1!4>"), roll.early(4).mask("<0!8 1!4>"))

arrange(
  [12, announce],
  // intro: plucks alone, then toms and the first distant vocal
  [8,  stack(plucks(.5, 2), hats.gain(.3))],
  [8,  stack(plucks(2, 3.5, SYNC), hats.gain(.3), rim, toms.gain(.2), far("<~ ~ ~ sultry_feelit:1 ~ ~ ~ ~>"), upl)],
  // build: kick and bass under the syncopated plucks
  [8,  stack(kick, clap, fill, hats, bass(Aroots), plucks(2.5, 4, SYNC), upl)],
  // A: 8 bars of groove with the lead held back and filtered, then it opens with open hats, shaker and the vocal
  [16, stack(kick, clap, fill, hats, open.mask("<0!8 1!8>"), shaker.mask("<0!8 1!8>"), bass(Aroots),
             plucks(3, 4.5, "<[x ~ x x ~ x x ~ x ~ x x ~ x ~ x]!8 x*16!8>"), stabs.mask("<1!8 0!8>"), lead.lpf("<1700!8 9000!8>").postgain("<.6!8 1!8>"),
             sixSeven.mask("<0!8 1!8>"), upl)],
  [8,  stack(pad(A, 800, 3000), lead.lpf(1500).gain(.3), riser, roll)],
  // drop 1: four bars of space (drums, bass and the vocal only), then everything
  [16, stack(drums, shaker.mask("<0!8 1!8>"), bass(Aroots), plucks(4, 4.5).mask("<0!4 1!12>"), pad(A, 2600, 3400).mask("<0!4 1!12>"),
             lead.mask("<0!4 1!12>"), sixSeven, chops.mask("<0!6 1!2>"), hey, upl)],
  // B: new chords; toms join for the second half
  [16, stack(kick, clap, fill, hats, rim, toms.mask("<0!8 1!8>"), bass(Broots), arps, pad(B, 1500, 4200), leadB, far("<~ ~ ~ ~ ~ ~ ~ sultry_feelit:1>"), upl)],
  // half-time bridge; everything stops for the last two beats and the vocal lands in the gap
  [8,  stack(stack(halfTime, sub(Aroots), pad(A, 600, 5000), lead.lpf(2000).gain(.3), riser).mask("<1!7 [1 1 0 0]>"),
             far("<~!7 [~ ~ sultry_feelit:1 ~]>"))],
  // final drop: full for 8 with the lead's second form, then the bass switches to the rolling line with stabs and toms
  [16, stack(drums, rim, shaker, bass(Aroots).mask("<1!8 0!8>"), rollingBass(Aroots).mask("<0!8 1!8>"), plucks(4.5, 5), stabs.mask("<0!8 1!8>"),
             toms.mask("<0!8 1!8>"), pad(A, 3000, 4500), leadVar, leadHigh, sixSeven, chops.mask("<0!6 1!2>"), hey, upl)],
  // outro: the plucks start drifting between the ears, wider as everything else leaves
  [8,  stack(kick, hats, bass(Aroots), plucks(4, 2).pan(sine.range(.2, .8).slow(2)), far("<[sultry_six ~ sultry_seven ~ ~ ~ ~ ~] ~ ~ ~ ~ ~ ~ ~>"))],
  [8,  stack(hats.gain(.3), plucks(2, .3, SYNC).pan(sine.range(.04, .96).slow(2)).phaser(.5), far("<~ ~ ~ ~ ~ ~ sultry_feelit ~>").pan(sine.range(.2, .8).slow(4)))],
)

