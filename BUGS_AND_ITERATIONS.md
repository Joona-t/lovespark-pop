# Bugs and iterations

## ITER-001 (2026-11-19): repo created
Research on claudia.gallery and DJ_Dave/Strudel written to research.md; build order in plan.md.

## ITER-002 (2026-11-19): five genre loops + live stream
Loops 01-05 (progressive house, pop house, electro, techno, hyperpop) each evaluated in the real strudel.cc REPL: no eval errors, events produced, samples loaded.
`tools/live/`: stdlib server pushes `patterns/live.strudel.js` over server-sent events; the page (`@strudel/repl@1.3.0`) evaluates each push live, with a gradient cyberpunk glyph grid that pulses on the beat. Verified: three pushes played in order with no errors; no sideways scroll at 375 px.

## BUG-001 (2026-11-19): `.add()` after `n()` warned "Can't do arithmetic on control pattern"
Root cause: `n("...").scale(...).add(7)` adds to a control pattern. Fix: put the arithmetic inside the mini-notation, `n("...".add(7)).scale(...)`. Re-run: 0 warnings, notes in key.

## BUG-002 (2026-11-19): live page broke every `note(...)` line
Root cause: the page script declared a global `function note()` for its log, which hid Strudel's `note()`, so `note("a1").s(...)` threw "Cannot read properties of undefined (reading 's')". Fix: renamed it `logLine`. Rule: page globals must never use a Strudel function name.

RSI: ~1 h, 3 retries -> top loss: a page global shadowing a Strudel function (caught only by evaluating real code) -> fix: renamed; every live change is checked for evalError after each push.

## ITER-003 (2026-11-19): first track cooked live, "Wake Signal" (06)
Deadmau5 x John Summit style, 126 BPM, F minor, 64 bars: intro 8, build 8, hook 16, breakdown 8, drop 16, outro 8. Built live in five pushes, then arranged with `arrange()`. Verified bar by bar in the page: layers per section as planned, snare roll 4/4/8/8/16/16/24/32 per bar, intro filter 400 -> 3725 Hz, outro 4200 -> 788 Hz, no eval errors. Not yet heard by Joona through to the end.
Live page: `// @q N` bar-quantized launches (the drop landed at cycle 139.976 against 140) and `// @top` to start an arranged track from bar 1.

## BUG-003 (2026-11-19): `chord("Fmaj7")` played nothing, with no error
Root cause: Strudel's voicing dictionary spells major sevenths `^7`; an unknown chord name yields zero events silently. Fix: `F^7`. Prevention: every push is checked for events per layer, not only for eval errors.

## Note: checking arranged code outside the editor
Strudel only parses "quoted" mini-notation through the editor's transpiler; plain JS sees literal strings. Checks outside the editor wrap each string in `mini()`. The scheduler's pattern (`repl.scheduler.pattern`) is what plays; `repl.state.pattern` can be stale after `setPattern`.

RSI: ~25 min cook, 3 detours -> top loss: silent failures (unknown chord name, stale pattern read) that throw no error -> fix: count events per layer on the scheduler's own pattern after every push.

## ITER-004 (2026-11-19): "Sugar Glitch" (07), hyperpop cooked live
160 BPM, D major, 80 bars: intro 8, groove 8, hook 16, switch-up 4, drop 16, switch-up 4, drop 16, outro 8. Five live pushes, each checked for events per layer on the scheduler's pattern; the drop landed on cycle 303.97 against 304. Arranged track verified bar by bar: both switch-ups 4/8/16/32 kicks, drop chords voiced an octave up. Played from bar 1 with no eval errors.

RSI: ~15 min cook, 0 re-work -> top loss: none worth fixing (the per-layer check caught nothing new) -> keep it.

## ITER-005 (2026-11-19): "Wake Signal (Extended Mix)" (08), developed from 06
Joona liked 06 and asked to develop it. 120 bars (~3:49): intro 16 (toms enter at bar 9), build 8, hook 16, break 8, drop 16, a new John Summit-style groove 16 (octave-jumping rolling bass, 909 toms, call-and-response chord stabs), break 8, drop 2 with a high countermelody 16, outro 16. Kick drops the last beat of every 8th bar into a clap fill. New sections cooked live first (no eval errors, countermelody F5-C6 in F minor), then the arrangement verified bar by bar: all 11 sections have the planned layers, both rolls 4/4/8/8/16/16/24/32. Playing from bar 1.
Also: the Claudio 3D brief went to Ashley PC (`C:\ashley\kpop\claudio\BRIEF.md`).

RSI: ~20 min, 0 re-work -> top loss: copying long code into the check by hand (3 kB per check) -> fix: none yet; when a fourth track needs it, add a `tools/check_track.js` that loads a file and prints bars per section.

## ITER-006 (2026-11-19): "Wake Signal (Awake Mix)" (09): sidechain, a real lead, a B-section, Rose singing
Joona: "take this to the next level"; then vocals from our voice models, and a faint pitched sung line ("I've been waiting for this... for such a long time / ... for all of my life") tuned to the song.
- Real sidechain: the kick ducks the music bus (`duckorbit`), sub under the bass, filter-envelope plucks, Fm9.
- Lead: 8-bar question and answer on an FM bell with octave echoes. B-section on new chords ending on C7. Half-time bridge.
- Rose (Qwen3-TTS, ashley-pc GPU; the Forge was busy with AI Psychosis thumbnails): 20 one-shots, all words confirmed by speech recognition; 42 takes of the sung line's phrases, 9 chosen.
- `tools/sing.py`: WORLD hard-tune. Measured on each note's own frames: all 15 notes within 8 cents except the tail of "this" (-24). Both full lines transcribe exactly after tuning.
- Verified on the scheduler's pattern while playing: 14 section checkpoints, sung line in break, drop, bridge and final drop, no sample load errors. Not yet heard to the end by Joona.
- Voice files are NOT in the repo (publishing them is Joona's call); the live server serves `samples/` locally.

## BUG-004 (2026-11-19): two-note phrases came out up to 61 cents off
Root cause: natural pitch movement was kept around the whole phrase's median, so a falling word put its first note sharp and its second flat. Fix: centre each note's frames on that note's own median. Check: `sing.py` prints cents off per note, measured on the frames assigned to it.

## BUG-005 (2026-11-19): `.gain()` after `.off()` made the echoes as loud as the notes
Root cause: a later `.gain` overrides the gain set inside `off`. Fix: set the main gain before `.off`. Caught by reading event gains off the playing pattern.

RSI: ~70 min, 4 detours (no ASR/vocoder ready on the Mac, blocked publish, 2 tuning fixes) -> top loss: finding a working voice + ASR + vocoder route from scratch (~25 min) -> fix: `tools/sing.py` and the venv now exist; the route (ashley-pc qwen env, venv-asr) is written in the brain note.

## ITER-007 (2026-11-19): 09 pared back on Joona's ear
Joona heard 09: "wake up" out ("keep it safe"), the sung line sounded too watery, then "too many lyrics is not good ... very minimalistic", "no robotic voices", and finally "remove the i have been waiting for this". Both are out of the arrangement (0 events each over 120 bars, checked on the playing pattern); the bell lead is back in the drops. Samples and the pattern lines are kept. Still in: "can you hear me", "signal", "follow the signal", "I'm awake now", ah-chops, hey.
Live page: `// @keep` swaps in an edited arrangement at the bar the current one has reached. `tools/sing.py` gained a one-file mode without time-stretching (`--notes`, `--keep`, `--formant`).
Lessons: (1) his dictation garbles words, so a surprising instruction ("robotic voices") gets a one-line check before work; I built a robot voice he never asked for. (2) WORLD-stretched speech sounded watery to him; any future sung vocal should come from a singing model (ACE-Step), not stretched speech.

## BUG-006 (2026-11-19): the voice audition never played
Root cause: `${v}` interpolation inside a backtick string; Strudel treats backtick strings as mini-notation, so the eval failed and the old track kept playing. Caught by reading evalError after the push. Rule: build pattern strings with ordinary quotes and `+`.

RSI: ~30 min, 2 wasted builds (robot voice, audition) -> top loss: acting on a garbled dictated instruction -> fix: confirm in one line when an instruction contradicts the direction so far.

## ITER-008 (2026-11-19): one voice, one line
Joona's direction after hearing 09: minimal lyrics, like English house. He auditioned four of our own voices with the new preview buttons on the live page, compared two back to back on the drop (`patterns/ab-soft-sultry.strudel.js`), and picked one. The whole lyric is now "six, seven ... can you feel it", once every 4 bars in A2, both drops and the outro, with "can you feel it" alone in the intro, B-section and bridge. Verified on the playing pattern: 43 vocal events over 120 bars in the planned bars, no other spoken phrases, no load errors. Voice samples stay local.
Live page: a voice preview panel (one button per verified take, read from `samples/house/scan.json`).

## BUG-007 (2026-11-19): audition voices silent, "Unable to decode audio data"
Root cause: a generated `samples()` map used double quotes; Strudel turns every double-quoted string into a pattern, so each file path became "[object Object]". Found from the network log and `soundMap`. Fix: single quotes in sample maps. Check after any push that loads samples: the sampler's "done" lines and zero decode errors, not only scheduled events.

RSI: ~50 min, 1 silent failure (~8 min) -> top loss: events were scheduled but no audio had loaded, and my check only counted events -> fix: sample pushes are verified by loaded-file lines and zero decode errors.

## ITER-009 (2026-11-19): "Cyber Space Set" (10): announcer and crowd intro
For the club-set video with Ash and Claudio. An 8-bar intro before the Awake Mix: an energetic British MC (designed voice) says Joona's two lines over a cheering crowd, a riser and snare roll lead into the set on bar 9. 128 bars, about 4:04. Announcer: 3 takes of each line, all word-perfect by speech recognition; take s42 used. Crowd: 30 shouts from six designed voices, layered 110 times with a synthetic room and a murmur bed (`samples/mc/crowd.wav`, 17 s). Samples local only.
Verified on the playing pattern: crowd and line 1 on bar 1, line 2 on bar 6, no kick in the intro, roll 24/32 on bars 7-8, set and drop where expected, both samples loaded, no errors.

## BUG-008 (2026-11-19): a launched track lost everything that started exactly on its first bar
Root cause: the page swapped the pattern in 60 ms before the bar line; the scheduler had already queried that window with the old pattern, so onsets on the launch bar were never scheduled (the announcer's first line and the crowd never triggered; earlier launches lost their first kick unnoticed). Fix: swap 450 ms early with a stitched pattern, old events before the bar line and new ones from it. Check: after a launch, the sampler's load lines for bar-1 samples and the events on the launch bar.

RSI: ~30 min, 1 re-launch -> top loss: BUG-008, found only because sample load lines were missing -> fix: stitched launch; bar-1 load lines are part of the launch check.

## ITER-010 (2026-11-19): announcer line 2 rewritten, intro 12 bars
Joona's new second line: "I don't know about you, but I'm ASI pilled, baby! Shout outs to Anthropic and Claude for making this all happen!" Six takes, all word-perfect by speech recognition (ASI written as spelled letters); the take with the held "baaaby" from the same seed as line 1 is used. Intro is now 12 bars (crowd re-enters at bar 7, roll 16/16/24/32 on bars 9-12), set on bar 13; 132 bars, about 4:11. Verified on the playing pattern after a stitched launch: new file loaded, no errors.

RSI: ~8 min, 0 re-work -> no loss worth fixing (one generation, one check, one launch).

## ITER-011 (2026-11-19): club set video, live Three.js preview
`tools/club/index.html`, served at `/club`: a Three.js stage whose every frame is a pure function of the set's bar position (the Strudel scheduler's clock), so lights, bounces and cuts land on the music with no keyframing. Ash's VRM at the decks, three code-built Claudios, 54 dancers behind the booth, glyph LED wall, six camera angles cut on bar lines. Brief and scene list: `video/club-set/brief.md`. Models are local only (`models/`, git-ignored).
Checked by screenshot at bars 2, 63, 64, 66 and live with audio: no console errors, set playing, scene in the right section. Found and fixed on the way: lights 5x too bright (three r160 uses physical units), the hidden editor leaking text, Ash's arm rotations inverted, hair physics exploding from the T-pose (spring bones now reset after the first posed frame). Not yet checked: 16:9 framing, phone width, a full run through all 132 bars, frame rate with the pane visible (the hidden pane throttles to 1 fps).

RSI: ~35 min, 5 look-fix rounds -> top loss: screenshots lagged the requested bar in the throttled pane, hiding what a change did -> fix: `club.render(bar, n)` renders the exact bar on demand; it is also the hook for the final frame render.

## ITER-012 (2026-11-19): real Claudios, crowd faces, fewer vocals
- The seven rigged Claudio VRMs from ashley-pc replace the code-built stand-ins in the club scene (local `models/claudio/`, not in the repo); each is scaled from its bounding box, squashes and hops on the beat, blinks, and uses its "surprised" expression on the first bar of a drop.
- Joona: "add faces to the people in the background": every dancer has eyes and a mouth that opens when they cheer.
- Joona: "too many vocals": the line now comes once every 8 bars (22 events over the set, was 43), the ah-chops are a 2-bar fill at the end of each 8 (40 events, was about 200), one "hey" per 8 bars, and the distant "can you feel it"s are halved. Both 09 and 10.
Checked: screenshot at bar 63 with all models loaded and no console errors; live run playing with the new counts read off the scheduler's pattern.

RSI: ~15 min, 0 re-work -> no loss worth fixing.

## ITER-013 (2026-11-19): crowd as cel-anime characters
Joona sent a retro cel-anime crowd frame as the style reference: "make them have hair etc... real unique faces". Taking the style cues, not those characters: every dancer now has a drawn anime face from a 64-cell sheet generated in code (eye shape, size, tilt and colour, brows, mouth, blush, the odd closed eyes or beauty mark, all seeded per person), one of six haircuts in twelve colours, six skin tones, a three-tone cel ramp, a slightly large head, and a blue key on the crowd. Heads nod on the beat and glance around; mouths open when they shout.
Checked by screenshot close on the crowd and live with audio (no console errors). First pass blew out to white: pastel cel colours under physical-unit lights; the crowd palette is now dimmed to 0.42 so the lights do the colouring.
Still capsule bodies; real character bodies or generated 2D art are the next step if this direction holds.

RSI: ~12 min, 1 look-fix round -> no loss worth fixing.

## ITER-014 (2026-11-19): starburst on every shirt
Joona: "this logo on all the peoples tshirt" (a pink starburst). Drawn in code (12 rounded rays) as one chest decal per dancer; checked by screenshot, no console errors. Open before anything public: the starburst is Claude's mark and belongs to Anthropic, like Claudio's look.

RSI: ~4 min, 0 re-work -> no loss worth fixing.

## ITER-015 (2026-11-19): neon, Lime as the DJ, MC Spark as the announcer
- Joona: neon signs, "Claude loves art", colours, glow, light from below, and "LoveSpark". Tube lettering is drawn in code (halo, glow, white core) on additive planes; each sign carries a point light, signs breathe, kick on the beat and flicker now and then; five underglow lights under the booth, stacks and podiums.
- Joona: "It's the lime character that I want" and "mcspark the announcer". Both VRMs come from ashley-pc (`vtuber/lime/v4`, `vtuber/mcspark/v2`; local `models/`, not in the repo). Lime replaces the older Ashley model at the decks. MC Spark stands out front with the mic at his mouth during his two lines (mouth moving), one arm in the air, then walks to the side as the set starts; the intro cuts to him for each line.
- Their models are self-lit (emissive hair, LEDs, headphones), which washed them out white under club lights: `tame()` scales emissive and base colour on load. Key light, spots, wash, strobe and bloom all came down to make room for the neon.
- Raised arms pointed sideways: "up" needed about 2.2 rad from the T-pose, not 1.25; the mic arm was tuned by eye over three tries.
Checked by screenshot at bars 1, 3, 61, 64 and 66, and live with audio: no console errors. Not yet checked: MC Spark's walk-off at bars 12-13, 16:9 framing, a full run.

RSI: ~25 min, 4 look-fix rounds -> top loss: arm rotations found by trial (3 rounds) -> fix: `tune` and `mcTune` are exposed on `window.club`, so a pose is tuned live in one round next time.

## ITER-016 (2026-11-19): channel art, a less repetitive set, the ear-to-ear ending
- **Channel art for Bvby Ash**, shot from the club scene with `club.still()` (fixed camera, any size, saved through `/save/` to local `renders/`): banner 2560x1440 with Lime and her name in neon inside the 1546x423 safe area (checked with a drawn guide), profile picture 1600x1600. First renders failed review: the hidden name signs' lights stayed on next to the DJ and washed her out (now a hidden sign lights nothing and name signs never light her), and the name was unreadable on the crowd (now on a dark board).
- **Structure** (Joona: "sounds a bit too repetitive", "more John Summit structure"), same 132 bars so the video stays in sync: syncopated plucks in intro B, build and A1; A holds the lead back filtered for 8 bars with stabs, then opens with open hats, shaker and the vocal; drop 1 starts with 4 bars of space (drums, bass, vocal) before everything lands; toms join B's second half; the bridge cuts to silence for two beats with the vocal in the gap; the final drop uses a second form of the lead that climbs, then switches to the octave-jumping bass with stabs and toms; a one-bar uplifter into every 8th bar line.
- **Ear to ear** (Joona: "that wavy effect towards the end ... from one ear to another"): the high lead drifts across the stereo field in the final drop; the outro plucks sweep left-right, wider in the last 8 bars with a phaser.
- **Mix pass, first half:** high-pass on plucks, pad, stabs and the vocal to clear the low end for kick and bass; hats, open hats, shaker and toms placed left and right of centre.
Verified on the playing pattern: 12 structural checks (stabs only in A1, shaker 8 vs 24 hits, no plucks in the drop's first 4 bars, silence then vocal at the bridge's end, toms only in the final drop's second half, 10 uplifters). A full take is being recorded from the live output for loudness measurement and mastering.

RSI: ~40 min, 2 re-renders of the art -> top loss: a hidden object's light kept lighting the scene, found only when a still was looked at -> fix: light intensity follows visibility; every still is reviewed with a guide before delivery.

## ITER-017 (2026-11-19): the structure rework was rejected; restored, with three notes applied
Joona heard ITER-016's rework live: "remove the metronome", "last version was better", "that acid bass doesnt fit", "67 can you feel it plays too fast needs to be more spaced out". Then he pasted a description of John Summit's style: rolling bass, crisp swung percussion, euphoric top end, sticky vocal hooks, clean mixdown, and "every 8 or 16 bars ... a subtle rhythmic switch, filter sweep, or percussive fill".
- Track 10 is restored to the arrangement before the rework. The rework is kept at `patterns/experiments/10b-structure-rework.strudel.js`.
- Kept from it: only the ear-to-ear drift of the outro plucks.
- New: the vocal is spaced out (six on beat 1, seven on beat 3, a bar of air, then the question); the bass filter is rounder (resonance 9 -> 2, envelope 3 -> 1.3).
- The "metronome" was most likely the toms the rework added (no tom events remain); the first reading (the intro hats) was wrong and that removal is undone with the restore.
Lesson: the rework changed about ten things in one pass, so one "worse" from him could not say which. Summit-style variation goes in one subtle touch per listen from here, each one vetoed or kept by ear.

## Security fix: the `/save/` route (found by the commit security review)
`POST /save/<name>` wrote files with no origin check, so any page open in the same browser could have posted to it. Now: Origin must be this server's own address, a custom `X-Club-Save: 1` header is required (a cross-site form cannot send it), and the body is streamed to disk. Checked: a POST without the header returns 403.

RSI: ~35 min on a rework that was reverted -> top loss: ten musical changes in one pass against a listener who judges by ear -> fix: one change per listen, announced before he hears it.

## ITER-018 (2026-11-19): "hey" removed
Joona: "this song is good almost remove the hey". Out of 09 and 10 (0 events over 132 bars on the playing pattern; sample and pattern line kept). Voice samples stay off the public repo (Joona: "no public repo for this").

RSI: ~3 min, 0 re-work -> no loss worth fixing.

## ITER-019 (2026-11-19): Bvby Ash channel art v2 (PFP + banner)
Joona: "a lime ash pfp and banner pfp of just her banner of her djing in the boiler room set with the claudios". The v1 stills (04:59) had crowd figures over her in the PFP, and in the banner she was small behind the decks with hard dark boards behind the name signs.
`still()` gains `solo` (hides crowd, MC and Claudios) and `crowdDim` (darkens the crowd so her white suit reads against it). PFP: 1600², bar 30.2, solo, a low 3/4 camera so her eyes show under the visor, the neon heart behind her. Banner: 2560×1440, bar 63.25 (drop, hand up), crowdDim .4, camera at her face height (a higher one put key-light glare on the visor). Checked as crops: the circle at 400 and 120 px, the desktop strip 2560×423 and the 1546×423 safe area (head, decks and a Claudio either side inside both). Files are local in `renders/` (git-ignored).

RSI: ~25 min, 10 test frames -> top loss: framing judged on the full 16:9 before checking the 423 px strip viewers actually see -> fix: guide boxes for the strip and safe area are drawn on every banner test from the first frame.

## ITER-019 (2026-11-19): the mix from stems, the hi-hat tick, Ash's arms, the six-seven emote
**Sound (Joona: "whats that clicking like sound is it the highhat? it takes up too much room sounds like a metronome", "mix master & layer correctly", "chain drums").**
- The tick was the closed hi-hat: straight eighths at up to 0.5 gain, and alone over the plucks in the intro and outro. Now short, high-passed at 7.5 kHz, 0.06/0.2 gain with the accent off the beat; no hats without a kick; rim at 0.16.
- The live sum was clipping: measured from an unclamped capture it peaks at **+4.5 dBFS** (true peak +4.6), -10.1 LUFS. The club page now plays 5 dB lower so the output no longer clips.
- Buses: kick (orbit 9), other drums (1), bass and sub (8), music (2), lead (3), chops (4), distant vocal (5), the line (6), announcer (7); the kick ducks music and bass.
- `?stems=<name>` on the club page captures the full mix and every bus as one 18-channel float stream through a worklet (sample-aligned, speakers disconnected), appended to `renders/<name>.f32`.
- `tools/mix.py`: null test (stems minus the full mix: **-33.0 dB**), bar 1 found from the first kick, every stem at the same gain (the balance that was played), low cuts so kick and bass own the low end, **kick + drums through one bus compressor and soft saturation**, steadier vocal and announcer, a light glue compressor, then a limiter to the target.
- Result: `master-14` **-14.1 LUFS, -1.3 dBTP, LRA 10.9**, 24-bit 48 kHz, 253.9 s starting on bar 1; `master-loud-10` -10.8 LUFS, -1.2 dBTP. Flat factor 0 on both (no flattened peaks). Not heard by anyone yet: Joona was on a break with the sound muted.

**Picture.**
- Joona: "her arms seem broken this is not correct" and "ash should be fist bumping in the air as well". Arms are now posed by direction (each bone turned the shortest way from its T-pose direction to where the elbow or hand should be), not by guessed Euler angles. Fist pumps: both arms on a drop's first bar, then right and left in turn on bars 2 and 4 of every four, once per four in the grooves; fingers curl into a fist; the fist is highest on the kick.
- Joona: "when the 67 emote comes have ashe do the 67 emote and the claudios. 2 of the claudios jump onto her hand for it the others do the 67 emote as well." On bars 45, 61, 69, 101, 109, 117: palms up, her left hand up on "six" and her right on "seven", for two bars; classic and shades jump from the booth onto her hands half a bar before, ride them, and hop back; the other five rock in turn; the camera cuts to a front shot.
- Her white outfit blew out under the strobe and the drop lights: the strobe moved over the crowd and her base colour is dimmed further.
Checked by screenshot (decks front and side, pump at bars 65.5 and 105.5, emote at 59.8, 61.0, 61.5 and 101.0), no console errors.

## BUG-009 (2026-11-19): every Claudio stopped moving
Root cause: an end-of-line comment was pasted in front of `claudios.push(c);` on the same line, so no Claudio was registered and none was animated. Caught before commit: the emote screenshot showed no riders, and the rider list read back empty. Check: after a scene edit, read `club.claudios.length` (must be 7) along with the screenshot.

RSI: ~75 min, 3 pose rounds, 3 mix-script reruns -> top loss: all earlier listening was through a clipping output (+4.5 dBFS) that no check measured -> fix: stems capture + `mix.py` measure peak, loudness and the null test on every master; the live page plays with headroom.

## ITER-020 (2026-11-19): sound button, curly MC Spark, Blender dance moves on the stage
- Joona: "Have the video play and let me watch it work. And if I have a mute option for the sound as well". The club page has a SOUND ON / OFF button (and the M key); the choice survives reloads. Scene tests now run in a second tab so his view keeps playing.
- Joona: "MC Spark. We have one with curly hair ... a chain around his neck that says ASI in big gold letters". That is the newer model on ashley-pc (`vtuber/mcspark/v3`); it replaces the v2 one here (local `models/`).
- Joona: "Yes, wire them in". The dances keyframed in Blender on ashley-pc (`vtuber/dance/dance.py`, made by the Claude there) are exported with `tools/blender/export_action.py` (armature and baked action only, 2-5 MB, about 3 s each) and played on the bar clock by `loadMove` / `playMove`: Lime steps back from the decks and dances through the 16-bar B-section (the move's own length), MC Spark dances for the whole set with the mic in his hand. Body bones only; hair and skirt stay on spring physics. Outside a move the code poses run as before.
Checked in a second tab by screenshot: Lime at bars 80.3, 84.6, 86.5 (the arms-out pose matches the PC's own render of that moment; her upper-arm rotation changes across five sampled bars), MC Spark at bars 3.3 and 66.5; then live in his tab: playing, both moves loaded, 7 Claudios, no console errors. Not checked: the cut into and out of the dance at bars 77 and 93 in motion, a full run.

RSI: ~20 min, 0 re-work -> no loss worth fixing (the skeletons matched on the first try because the moves and the VRMs come from the same Blender files).

## ITER-021 (2026-11-19): full-body dancers and a fluid Ash on the stage
- Joona: "It's a little bit boring right now ... let's have the movement of Ash be a little more fluid. Maybe some of the background characters come closer and dance as well. Like a proper ballroom set ... the people in the back, they have their arms connected and they have legs". After a 16-bar Blender preview: "Yes, put on stage".
- Ash's dance in the B section now plays `lime_dance_fluid.glb` (ashley-pc `kpop/club-set/fluid.py`): keyed every 2nd frame from the beat clock with a delay per joint, where the older `lime_dance.glb` held one pose per beat.
- The capsule crowd is replaced by 54 skinned dancers from `models/anim/dancers/dancer_lead.glb` and `dancer_follow.glb` (ashley-pc `kpop/club-set/crowd.py`, about 270 KB each): joined arms, legs, a bell skirt on the follower. The front two rows form 8 couples in a ballroom hold that turn once every 8 bars; the other 38 dance solo. Each dancer keeps its drawn head, hair and shirt starburst. Everyone moves up to 0.3 m toward the booth with the section's energy. Four bars of clip are mapped onto four bars of music, so a clip cannot drift off the beat.
- If the dancer files are missing (`models/` is local), the capsule crowd is shown as before.
- Lost for now: the phones some of the crowd held up. The DJ-at-the-decks poses are unchanged (the code poses carry the six-seven emote and its riders).
Checked in a second tab by four stills (`renders/stage-dancers-high-62.png`, `stage-dancers-side-62.png`, `stage-ash-dance-80.png`, `stage-ash-dance-83.png`) and by reading back `club.dancers.length` = 54 with 16 paired, both moves loaded. Not checked: playback watched by a person, phone and tablet widths.

RSI: ~15 min, 1 edit pass, 0 re-work -> no loss worth fixing (bone names and clip names came from the script that exported them).

## BUG-010 (2026-11-19): the new dancers cut the stage to about 10 frames a second
Commit 5531323 gave each of the 54 dancers its own skeleton and animation mixer (216 skinned parts, 216 bone updates a frame). Measured in the browser pane at 1024 x 768: 7 to 12 frames a second with the dancers, 34 with the capsule crowd. It was pushed before the frame rate was measured. Fix: dancers that share a body, a clip and a bar offset now share one hidden rig (14 rigs for 54 dancers); each dancer is a set of detached skinned meshes placed by its holder. Measured after: 28 to 29 frames a second, stills unchanged. Check: after a crowd change, count `club.frames` over 3 seconds with and without the change.

RSI: ~10 min, 1 re-work -> top loss: a pushed commit at a third of the frame rate, because stills cannot show speed -> fix: frame rate is measured before committing any stage change that adds animated objects.

## ITER-020 (2026-11-19): first full club video, rendered on the Forge
Joona: "Render it". `tools/club/render_video.mjs` (Node + playwright-core) opens the club page in headless Chromium, puts it in offline mode (`club.offline`, `club.shot`: the page's own loop stops) and takes one frame per video frame at bar = t × 126/240, so picture and the master line up by construction. Each process warms up 90 frames before its range so hair and cloth physics have settled at the join.
Forge: ANGLE on Vulkan reaches the NVIDIA cards (ANGLE on EGL fell back to the CPU's integrated graphics, 12.5 fps); `MESA_VK_DEVICE_SELECT=10de:2203` / `10de:2204` picks card 0 / card 1. Two halves at about 30 fps each, both cards at once: 7,618 frames in 127 s, beside the idle vLLM server (about 600 MB extra per card). Output `renders/cyber-space-set-v1.mp4`: 1920×1080, 30 fps, 253.93 s, -14 LUFS master, AAC 320k.
Checked: frame count against audio length, a 12-frame contact sheet across every section, frames 3807-3810 across the join (no jump).

## BUG-007 (2026-11-19): neon signs drew in a plain serif on the Forge
Root cause: the sign font list was macOS-only (Brush Script MT, Snell Roundhand); Linux has neither and fell back to serif. Fix: Yellowtail (OFL, Google Fonts) first, loaded before the signs are drawn. Mac and Forge now match.
Open: on the first bar of the drop (bar 61) Ash flashes almost pure white for a moment.

RSI: ~15 min wall, 127 s render -> top loss: 3 dead ends setting up the Forge (Python 3.14 with no pip, the .md copy rule, EGL on the wrong GPU) -> fix: the Node renderer and its flags are in the repo, so the next render is one rsync and two commands.

## ITER-022 (2026-11-19): the fluid DJ move at the decks, with the pumps and the six-seven on top
Joona, on the new clips from ashley-pc: "Yes, wire them in". By then other sessions had already put the full-body dancers and the fluid B-section dance on the stage (ITER-021), so the piece left was `lime_dj_fluid.glb` (16 bars at 126 BPM: cueing, scratching, riding the fader). Outside the announcer intro and the B-section her body now comes from that move, looped from bar 13 so it stays in phase with the 8-bar sections. The code pose is still computed every frame and written to the skeleton first; the move is laid over it, and each arm (shoulder to fingertips) is blended back toward the code pose by how much that arm is pumping or doing the six-seven. So the fist pumps, the emote and the two Claudios riding her hands are unchanged.
Checked by screenshot: hands on the mixer at bars 38.3 and 41.6 (front and side), right fist up at 65.5, emote at 61.0 with both riders at her palm positions (read back numerically). No new console errors. Not checked: frame rate with the extra skeleton update, the move in motion, a full run.
A first try stored the bone list on `vrm.userData`, which a VRM object does not have; caught on the first render call.

RSI: ~12 min, 1 re-run -> top loss: ~4 min rediscovering that other sessions had already wired the dancers and the fluid dance -> fix: read `git log` and the tail of this file before planning a change to a shared file.

## BUG-008 (2026-11-19): Ash flashed white in the drops (video v1)
Measured over the whole video (share of each frame at or above 240 on all channels): two stretches, 122.9-128.7 s and 210.5-214.8 s, up to 1.7% of the frame. Root cause: the five floor glows had a 5 m range and the scene has no shadows, so they lit Ash through the booth. When she leant over the mixer her white suit faced them, crossed the bloom threshold, and the drop's stronger bloom spread it over her. Proven on a fresh page each run: bloom off gave 0%; floor-glow range 1.4 m gave 0% at the worst frame (3700), against 1.03% before. Dead ends, kept so they are not tried again: it is not the Forge driver (the Mac reproduced it with the same 100 frames of history), not NaN/Inf (a clamp pass changed nothing), not her LEDs' emissive, and not her base colour alone (.45 still gave 0.67%). The light-by-light test only became reliable once each run used a fresh page: state carries over between runs.
Video v2: 0 frames over 0.5% white (v1: 19), highest 0.19%.

## ITER-021 (2026-11-19): Ash dances in the intro; the Claudios circle her
Joona: "we need ash to dance more in the ebeginning have the claudios also dance and circle her at some point". Ash steps off the decks to dance through the second intro and the build (bars 21-36, one dance clock so the move does not restart at the build), and in the half-time bridge at half speed, as well as in B. The second intro opens on the close shot. In the bridge (bars 93-100) all seven Claudios fly in over one bar, orbit her at chest height a quarter turn per bar, hopping on every beat and spinning every half bar, and fly home in the last bar before the final drop; the camera is in front for four bars, then high. Previewed at 12 frames before the render; video v2 rendered on both Forge GPUs (125 s and 126 s).

RSI: ~1 h -> top loss: chasing a driver bug for 4 runs because the first light test reused page state between runs -> fix: diagnostics on the stage use a fresh page per variant, written up above.

## ITER-023 (2026-11-19): video v3: 3 minutes, line once per 16 bars, detailed decks, disco ball, the whole club does the six-seven
Joona, after v2: "more detail on the turntable and better choreographed dance 6 7 and can you feel it even less appears too often", "disco ball as well", "lets end it around 3 minutes".
- **3 minutes:** 96 bars (3:03): announcer 12, intro 8, build 8, A 8, breakdown 8, drop 16, B 8, bridge 8, final drop 16, outro 4. The scene's SECTIONS, SIXSEVEN, DANCE, RING, `BARS` in the page, `render_video.mjs` and `mix.py` (FIRST_KICK_BAR 20) all moved with it.
- **Vocal:** "six, seven ... can you feel it" once per 16 bars, three times (bars 29, 45, 77), was six; the distant "can you feel it" once (the bridge gap), was five. Read off the playing pattern.
- **Mix:** re-captured from stems (186 s) and mastered: -14.0 LUFS, -1.4 dBTP, null test -32.8 dB.
- **Turntables:** strobe-dotted aluminium platter, a record with grooves, track gaps and a LoveSpark label, tonearm with base, headshell and counterweight, arm rest, pitch fader with ticks, start/stop, 33/45, target light; the mixer has EQ knobs, channel faders and a crossfader that rides with her fader hand. A deck close-up joins the camera rotation.
- **Disco ball:** 418 mirror tiles that glint when they turn toward the camera, light spots that sweep the back wall and floor (one turn per 8 bars, brighter with the energy).
- **Six-seven:** the whole floor does it with her: each shared crowd rig drops its dance and aims its arms by direction (palms up, hands taking turns, swing 46 cm); her torso leans away from the rising hand and her head tilts to it; the Claudios jump left side on "six", right side on "seven"; the camera holds her for the first bar and cuts high and wide for the second.
- Render on the Forge, both cards (3090 Ti and 3090): 5,560 frames in 94 and 96 s, `renders/cyber-space-set-v3.mp4`, 3:05, -14.1 LUFS.
Checked: 16-frame contact sheet across the video (ball, decks, emote at 29 and 45 with the riders on her hands), crowd hand heights read back (left 0.61 / right 0.16 m above the hips on "six", reversed on "seven").

## BUG-011 (2026-11-19): the crowd's six-seven did nothing
Root cause: GLTFLoader removes dots from node names, so `upper_arm.L` is `upper_armL`; the lookup found nothing and the function returned silently. Caught by reading bone positions back, not by the screenshot (arms move in the dance anyway). Fix: real names, and a console warning if any arm bone is missing.

## BUG-012 (2026-11-19): the first v3 render used the old scene
Root cause: a file sync stalled; I killed it and copied the files by hand, but the stalled command carried on and launched the render 6 s before the new stage file landed (Forge mtime 13:52:34, render start 13:52:28). That render had v2's 132-bar scene over the new 96-bar music, no ball and no new decks. Caught on the contact sheet (no ball anywhere). A second launch I made collided with it and failed harmlessly. Fix: the render was redone after checking the Forge files' md5 against the repo. Prevention: start a render only in the same command that verified the md5s; never leave a backgrounded copy-and-launch running while copying by hand. Also: the stalled `rsync --delete-excluded` may have removed the other session's `diag*.mjs` scripts from the Forge stage folder (they are gone; it is not certain which removed them).

RSI: ~55 min, 1 wasted render (2 min) and 1 silent no-op -> top loss: a render launched on stale files -> fix: md5 check and launch in one step.

## ITER-024 (2026-11-19): video v4: one-breath announcer over the song, 3:20, clean ending, the 10-second tongue-out six-seven, a varied crowd
Joona, on v3: no hair clip and prismatic goggles; the announcer should be "one run-on sentence", the crowd "already cheering at the start" and "cut off once the announcer stops", with "Ash's song already start[ing] when the announcer's announcing"; "make the ending a little bit cleaner ... like 3 minutes, 19 seconds"; the background characters "doing different dances, not all moving like a hive mind"; the Claudio ring was "going through the couple dancing in the back"; "when Ash does the 6-7 emoji for the first time, like all the Claudios glitch out"; and the six-seven "more 6-7-ish ... stick out her tongue ... emphasize it more ... dances like that for ... maybe 10 seconds".
- **Look:** the hair clip (`Lime_ClaudioClip`) is hidden; the visor lens is a physical material with a rainbow that drifts across it, a mirror finish, iridescence and a neon room to reflect.
- **Announcer:** one take of the whole text, six seeds voiced on ashley-pc; s3 used (14.1 s, every word right, longest gap 0.10 s). The crowd bed is cut to his length (no fade-in, 0.25 s fade-out). Both start on bar 1 over the opening plucks; MC Spark talks until bar 7.4, then steps aside.
- **Length and ending:** 104 bars, master 3:20.6 (-14.1 LUFS, -1.2 dBTP). The outro thins over four bars, the plucks sweep ear to ear and close, a pad fades, and the last bar is one hit (kick, clap, Fm9 chord) that rings out.
- **Six-seven:** about 10 seconds (5 bars) at bars 25, 41 and 81; bigger swing and lean; a bounce on every beat; tongue out (a small cel-shaded tongue on the head bone; the face has no tongue shape) with her mouth open and a wink; camera close, wide, close, room, close.
- **Glitch:** the first six-seven begins half a bar early, inside the build where Ash was dancing; the dance path returned before her hand positions were updated, so the riders jumped toward stale positions. The six-seven now takes over from a dance. Checked: rider positions at bars 23.55 / 23.8 / 24.0 move smoothly from the booth to her palms.
- **Ring:** an ellipse (depth 0.48), so the Claudios stay between Ash and the booth.
- **Crowd:** solo dancers get one of five styles over their clip (as is, hands-up wave, fist pump, overhead clap, low groove), stronger as the energy rises, and 8 offsets into the clip; couples get 8 offsets.
Checked by screenshot: tongue placement close up, first emote riders, ring from above, crowd in the drop; no new console errors.

RSI: ~40 min, 1 tongue-placement round -> no loss worth fixing (the md5-and-launch step worked first time).

## ITER-025 (2026-11-19): video v5: mic at his mouth, movement audit, the kick comes in first
- Joona: "The announcer is not holding the mic next to his mouth when he's talking." His Blender dance holds the mic at chest height. While he talks (bars 1 to 7.4) a two-joint IK brings his right hand to a point just below and in front of his mouth, turning each arm bone by the smallest rotation so the wrist and the mic angle carry over; it eases out when he stops. Checked close up at bars 2.5 and 5.5.
- Joona: "arm going backwards as well" (a screenshot of Ash), then "one more audit through all the movements and the 3D aspect". Audit over all 6,017 frames, reading her arm bones back: 0 frames with a hand more than 20 cm behind her shoulder in room space, 0 in her chest's own frame; the only flagged pose is the headphone cue (hand at her ear). What he saw is the dance's arms-out-to-the-side move filmed from the side camera, where a sideways arm reads as bent backwards. Fix: while she dances (build, B) the camera uses front views only. The two largest hand jumps (0.7 m at bar 9, 0.9 m at bar 24.5) are pose switches that land on camera cuts.
- Joona: "add the kick to the song a little bit earlier ... The build up all happens kind of all at once." The kick enters alone at bar 9, hats at 13, clap and bass at 17. Master re-made from stems: -14.2 LUFS, -1.5 dBTP, 3:20.6.
- Render v5 on both Forge cards: 6,017 frames, 110 and 111 s; files md5-checked in the launch step. 12-frame sheet checked (mic at his mouth in the announcer shots, front views in the dance sections).
Not audited by measurement: the 54 crowd dancers and the Claudios beyond the earlier screenshot checks.

RSI: ~45 min, 3 audit scans -> top loss: two scans built on the wrong reading of the screenshot (about 6 min) -> fix: work out the camera's view of the pose before measuring.

## ITER-026 (2026-11-19): video v6: a fade-out ending
Joona on v5: "don't have that stuttering at the end. Just lower it down. Like have the music kind of fade out at the right point." The outro is now a steady groove (kick, clap, hats, bass, plucks, pad) for its 8 bars with no parts dropping in and out and no last hit; `mix.py` fades the master from bar 97 to the end (measured every 2 s from 2:56: -15 -15 -15 -16 -16 -16 -17 -18 -22 -25 -33 dB) and the picture fades to black with it. 198.1 s (3:18), -14.2 LUFS, -1.4 dBTP. Rendered on both Forge cards.

## BUG-013 (2026-11-19): a stem capture lost its drums near the end
The first v6 capture had the kick and drum buses silent for bars 97-99 and 103-104 (and thin in 95-96) while bass and music played; the pattern has four kicks in each of those bars. Found by measuring the fade, which dipped 10 dB and came back. Most likely cause: the Browser pane was hidden and the page's audio was disconnected from the speakers, so the browser throttled the page and late drum hits were skipped; the re-capture with the pane visible was clean. Not proven beyond that one clean re-run. Earlier masters (v3 to v5) were never kick-counted, so their endings may have had the same fault. Check added: `mix.py` prints every bar with fewer than four kicks. Rule: capture stems with the pane visible.

## BUG-014 (2026-11-19): a capture died on a full disk and the wait never ended
The Mac had 790 MB free; the capture's appends failed a minute in and my wait loop (no time limit, a size threshold the file never reached) sat for 17 minutes. Fix: waits have a limit and report the length; old stem captures are deleted once a master is made (takes 4 to 8 removed, 2.4 GB+).

RSI: ~50 min for a fade, 2 failed captures -> top loss: 17 min of unbounded waiting on a full disk -> fix: bounded waits, a disk check before a capture, and the kick gate.

## ITER-027 (2026-11-19): video v7: 2:40, the Claudios circle Ash through her dance, hair behind the goggles, three review passes
Joona on v6: "at 1:47 the claudios should circle lime ash and her hair clips through the goggles do multiple passes of the video fixing the small things", then "2:30 is a good length for the track maybe 2:45".
- **Length:** 84 bars, 2:40 (B-section, final drop and the second half of the intro shortened). Sections, the six-seven bars (21, 37, 69), dances, ring, picture fade, `render_video.mjs` and `mix.py` all moved. Master from a fresh stem capture (pane visible): -14.2 LUFS, -1.4 dBTP, kick gate clean (only the expected fill, breakdown and half-time bars).
- **Ring:** from the start of her dance (bar 53, about 1:39 in the new timing) through the bridge; the first 4 bars of the dance are shot from above so the circle reads.
- **Goggles:** the lens and frame are pushed 7 mm out along their normals and win near depth ties (polygon offset); her bangs stay behind the lens in all seven close-ups checked.
- **Review passes:** (1) 24 frames across the video in the render's own camera path: the ring was too small in the wide shot (fixed above); (2) 15 close-ups (face, ring from above, the six-seven): found the tongue and wink could carry into a dance that starts right after a six-seven (the dance path never reset them); fixed; (3) 18 frames of the final Forge render.
- Render on both Forge cards: 4,800 frames, 89 and 90 s; `renders/cyber-space-set-v7.mp4`.

RSI: ~45 min, 1 slow review render (6 min in a throttled pane) -> top loss: the close-up review ran in the browser pane at about 1 frame per 0.8 s -> fix: next time, render review frames on the Forge with the same renderer (render_video.mjs takes any frame range).

## ITER-028 (2026-11-19): release package for Audius and DistroKid
Joona: "put a folder in my downloads called Baby Ash project ... the video ... the actual music ... new album cover art with her and the Claudios ... upload those to Audius ... DistroKid". In `~/Downloads/Baby Ash project/`: the v7 video; the master as 16-bit 44.1 kHz WAV (DistroKid), 24-bit 48 kHz WAV and 320 kbps MP3 (all 160.0 s, -14.2 LUFS, -1.4 dBTP); three covers at 3000 x 3000 (JPG and PNG): A (the six-seven with the Claudios on her hands, her name in neon, the disco ball and the LoveSpark sign), A store (the same without the LoveSpark sign: the only text is the artist name), B (from above, the Claudio ring and the crowd, no text).
`club.still(..., { cover: true | 'store' })` hides third-party marks for release art: the "Claude loves art" sign, the starburst heart, the booth sign and the shirt starbursts. The record labels now show a LoveSpark heart instead of a starburst (in the video too, from the next render).
Open before release (Joona's call): the intro says "This is Boiler Room" (another company's brand) and shouts out Anthropic and Claude; Claudio is styled after Claude's mascot.

RSI: ~25 min, 1 framing round -> no loss worth fixing.

## ITER-029 (2026-11-20): track 11 "Night Shift", deadmau5 x Kaskade progressive house
Joona: "deadmau5 x kaskade is what we want to emulate ... deadmau5 signature synths", with a brief on the mau5 method (few layers at full fidelity, clean low end, filter-envelope pluck opening over 32-64 bars instead of risers, micro-automation, loop resolution). Cooked live in four pushes (groove; Summit roll + organ; pluck arp + pad; full arrangement), every push checked for eval errors and events per layer on the scheduler. Final: 128 BPM, A minor, Am9 Fmaj9 C^7 G6, 96 bars (intro 16, journey 32, breakdown 16, drop 24, outro 8). Only kick and bass sit below 180 Hz (every other layer high-passed); the 3-3-2 chord-stab pluck opens 300 -> 3400 Hz across the sections; reverb and pan drift slowly; original melody, no samples from the reference tracks. `patterns/11-night-shift.strudel.js`.

RSI: ~20 min, 4 live pushes -> top loss: none heard yet (verification is event counts, not a listen) -> fix: Joona's listen is the test; render a WAV when he signs off.

## ITER-030 (2026-11-20): Night Shift pluck, custom three-oscillator patch
Joona: "synth needs to be customized more but this is decent". The single detuned saw became a patch: A a 3-voice supersaw body, B a square an octave up (glassy top), C an FM sine an octave up with a 50 ms FM decay (the attack tick), all through one resonant filter envelope (lpenv 4, 2 ms attack, 120 ms decay, q 9), with a small pitch dip on the attack (penv -0.3, 30 ms), slow vibrato drift (4.5 Hz, 0.05) and light saturation (shape 0.12). Pushed with `@keep` so the arrangement didn't restart; checked on the scheduler: all three layers fire in all five sections, parameters arrive on the events.

RSI: ~10 min, 1 push -> top loss: still verified by events, not by ear -> fix: Joona's listen; render a WAV for an A/B against the old pluck if he wants it.

## ITER-031 (2026-11-20): track 11 restarted as "Slow Light"
Joona: "Scrap it completely. Let's start again. Deadmau chords and synth is important", then after hearing chords, drums and bass arrive one stage at a time: "I give you full creative vision. Bring your vision to life". Night Shift (ITER-029, ITER-030) is deleted. Slow Light: 128 BPM, F# minor, 152 bars (~4:45): intro 16, groove 16, build 16, breakdown 24, drop 32, lift 16 (B chords), return 16, outro 16.
- **Chords** written note by note (not from `chord().voicing()`): F#m9, Dmaj9, Amaj9, Esus4 -> E, top notes held across changes; B section Bm9, Dmaj9, F#m9, Esus4 -> E with the top voice climbing.
- **Synth:** one pluck (two detuned saws, resonant ladder low-pass, 110 ms filter envelope) on steady 16ths; its cutoff is the arrangement: 320 Hz at bar 1, 4200 Hz at the peak, 320 Hz at the end. No risers or snare rolls.
- **Melody:** 8 bars in 3-3-2 phrasing, an FM bell in the breakdown, a saw + square lead in the drop, both in the return.
- **Low end:** only kick and sine-sub bass below 200 Hz; kick ducks the music and bass buses.
- Checked on the scheduler: no eval error; layers present in all 11 arrangement rows; cutoff at the first and last bar of each row matches the plan (e.g. row 1 320-479, drop 3200-3799, last row 1200-327).

RSI: ~35 min, 5 live pushes, 0 eval errors -> top loss: the first attempt (Night Shift) was built from a generic chord chart and a stacked patch before Joona had judged the chords and synth alone -> fix: every new track starts with chords + main synth solo and waits for his ears before any other layer (done from the restart on).

## ITER-032 (2026-11-20): Slow Light mixed and mastered; stem capture for any live track
Joona: "mix & master". The club page's stem capture and `mix.py` were tied to track 10, so the live page got the same capture and a mix script that takes the track's numbers.
- **Live page:** `/?stems=<name>&bars=<N>` records the full mix and every bus (kick 9, drums 1, music 2, bass 3, bell 4) as one 10-channel float stream to `renders/<name>.f32` for one pass from bar 1. `&warm=<sample names>` plays each sample silently first (a sample's first hit is lost while it loads). `&auto=1` starts by itself, for a headless Chrome (`--headless=new --autoplay-policy=no-user-gesture-required --mute-audio`). The server now accepts query strings on `/`.
- **`tools/mix_live.py`** (`--bpm --bars --first-kick-bar`): null test, bar 1 from the first kick, kicks counted in every bar, the balance as played with corrective processing only (low cuts so kick and bass own the low end, kick + tops through one bus compressor and soft saturation, light glue compressor, the delay tail fades over 1.5 bars), masters with a limiter.
- **Result** (`renders/slow-light-master-14.wav`, 24-bit 48 kHz, and `.mp3`): 4:47.8, **-14.2 LUFS, -1.4 dBTP**, LRA 11.9. Null test -33.2 dB. Four kicks in every bar of 9-48 and 73-148, none elsewhere, as written. The loud master reached -11.4 LUFS against a -10 target (the limiter ran out at its ceiling; not chased).
- **Found by the capture:** the live sum peaks at **+3.6 dBFS** (kick at 0 dBFS, music bus -7.6), so everything heard in the live page during the cook was clipping at the output. The master does not.

## BUG-014 (2026-11-20): a stem capture with the kick, the pluck and the pad silent
The first complete capture had an empty kick stem and an empty music stem until the lead entered at bar 73; the null test still passed (-150 dB), because the missing voices were missing from the full mix too. Cause: the new sample warm-up called `superdough()` before Strudel's audio had been initialised, so its worklets (supersaw, ladder filter, shape) were never registered and every voice that needs one stayed silent for the pass; plain oscillators and samples played. Fix: `await initAudio()` before the warm-up. Proven on a 12-bar capture before the full pass (pluck 0.29 peak from bar 1, kick 1.0 from bar 9). The null test cannot see this class of fault; the per-stem peak table and the kicks-per-bar line can, and `mix_live.py` now stops when the kick stem is empty (it did: that is how it was found).
Also: two captures in the visible Browser pane ended early (276 s and 227 s of 288) because the pane closed mid-pass. Captures now run in a headless Chrome.

## ITER-033 (2026-11-20): Slow Light visualiser, the track's music video
Joona: "create a binary glyph grid visualiser for this song", then "the visualizer will in essence be the music video", then, with two glyph-grid-studio plates (charcoal on cream): "more so beige background paper like this from my glyph grid studio and forming different shapes like beautiful flowers ... painting through pixels and syntax". The first version (neon binary city with a robot colossus) was replaced before it was committed.
- `tools/viz/slow-light.html` (served at `/viz/slow-light.html`): the studio's method and cream-paper palette (`#E8DDC8` paper, `#0E0805` ink). A scene is painted into a small ink buffer with canvas paths, then each cell of a 320 x 135 grid becomes one glyph (the studio's gradient ramp with code glyphs mixed in: `<>/{}01`), density and opacity from the ink; the stipple re-rolls on the 8th notes.
- Every frame is a pure function of the bar position (no state, no `Math.random`): `?bar=N` holds a frame, PLAY runs it on the master's clock, `window.viz.shot(bar)` returns a frame for `tools/viz/render_viz.mjs` (frame-exact video render, not run yet).
- Scenes follow the song: title and one stem growing with the pluck; a garden of nine stems (grass arrives with the kick, stems that belong to the bass note sway harder); buds open with the filter; breakdown: one great flower opens over 22 bars, each bell note a ring of pollen; drop: full bloom, rays as long as the filter is open, each lead note a thrown petal; lift: a blossoming branch; return: the garden in full flower, light and petals falling; outro: the studio's stardust dispersal to blank paper.
- Looked at: bars 3.5, 20, 44, 60, 76, 88, 113, 116, 128, 145 in the pane; live with the master it runs at the display rate (120 fps measured) with the audio clock advancing. Not done: the video render, and the repo has no automated layout check for this page (only glyph art and a dot-letter title, no body text).

RSI: ~95 min, 4 stem captures (2 cut short by the pane closing, 1 silent-voice, 1 good), 1 visualiser rebuilt -> top loss: three wasted real-time captures (~14 min) -> fix: captures run headless and a 12-bar test capture comes before any full pass; the visualiser brief should have asked "which of your looks" before building, so the first version was wasted (~15 min): for a visual, name the reference look first.

## ITER-034 (2026-11-20): Slow Light visualiser rebuilt as one growing picture
Joona, on ITER-033: the grass row looked like a bar code, "too much empty space", "also over lapping" (scenes crossfading over each other, heads and leaves across stems), "plants should just be growing, and there should be some like visualizer above that reflects the [music]", "clean up the visualizer make it professional and aesthetic and SOTA".
- **One picture, no cuts.** Eleven plants, each in its own 172 px lane, short under the sun and tall at the sides; growth never stops (over half in the first 26 bars, the rest by the end of the lift). Roots grow down as stems grow up. Buds open one by one from bar 34 to 69. The scene crossfades, the grass, the pollen specks, the falling petals and the soil band are gone.
- **A real visualiser above.** `tools/viz/analyze.py` writes the master's spectrum (32 log bands, 30 frames a second, `slow-light-spectrum.json`); the sun's rays are those bands, bass at the bottom and treble at the top, mirrored. Its size follows the pluck's filter and it beats with the kick. Read from a file, so a video render shows exactly what the live page shows.
- **Finer ink.** 480 x 180 cells (was 320 x 135), 8 px glyphs, thinner strokes; the stipple re-rolls a quarter of the cells per beat instead of all of them every 8th note.
- **Layout check** (`viz.check()` in the page, `tools/viz/check_layout.mjs` from the shell): every eighth of a bar, each flower head against its neighbours, the sun's halo, the frame and the title. It failed on a real defect first: with the sun's reach at 80 + 90 L it reported flower 3 touching the halo from bar 84 (40+ hits); at 70 + 68 L it reports 0. The check covers heads, sun and title; leaves and roots are kept in their lanes by construction (leaf length at most 62 px, lane half-width 86) and are not measured.
- Looked at: bars 3.5, 20, 40, 60, 78, 90, 100, 126, 146 at 1280 x 720 in the pane. Not done: the video render; `check_layout.mjs` has not been run from the shell (no Playwright in this checkout; the same function ran in the pane).

RSI: ~30 min, 3 looks -> top loss: ITER-033 shipped scene crossfades and free-placed plants with nothing measuring overlap -> fix: lanes by construction plus viz.check(), which failed on a real overlap before it passed.

## ITER-035 (2026-11-20): Slow Light video rendered; cover and release folder for Bvby Ash
Joona: "Render the video", then "make it [the cover] from one of the still shots from the visualizer. You're choosing. And the artist name will be Bvby Ash ... put this under the Baby Ash one".
- **Video:** `tools/viz/render_viz.mjs`, two halves at once in headless Chrome on the MacBook (4,318 frames each, 214 s for the slower half, about 20 frames a second each), joined and muxed with the master: `renders/slow-light-video.mp4`, 1920 x 1080, 30 fps, 8,633 frames, 4:47.8, H.264 + AAC 320k. Looked at a contact sheet of frames 90, 1500, 4318, 4319 (the join), 5600, 7400, 8300, 8620: title, growth, full bloom, dispersal, blank paper; the two frames at the join match. `check_layout.mjs` from the shell: clean.
- **Cover:** `?scale=2.7778&cover` draws the glyph atlas at 3000 px high (sharp, not upscaled) with the five middle lanes only; bar 126 (full bloom, the sun open), middle square cropped: `slow-light-cover.png/.jpg`, 3000 x 3000, no text. `tools/viz/still.mjs` makes any still.
- **Release folder** `~/Downloads/Baby Ash project/Slow Light/`: DistroKid WAV (16-bit 44.1 kHz, triangular dither, -14.2 LUFS, -1.4 dBFS peak, 287.8 s), 24-bit 48 kHz master, MP3, cover JPG + PNG, video.
- **DistroKid upload not done.** Computer use can only read a browser window (no clicks or typing), the Claude in Chrome extension is not connected in this session, and the app's own Browser pane is signed out of DistroKid. Waiting on Joona for one of: connect the extension, sign in to DistroKid in the pane, or upload by hand.

RSI: ~20 min, 1 failed ffmpeg call (soxr not in this build; the fallback after a pipe never ran) -> top loss: none worth a check -> none.

## ITER-036 (2026-11-20): Slow Light balance v2
Joona, after listening on headphones and against other house tracks: "kick in the beginning overpowers and perhaps melody should be louder". (His first note, "the kick is too heavy ... same with high hats", he withdrew after the headphone listen, so the hats are unchanged.)
- Kick: 1.0 everywhere became .4 in the intro, .5 in the groove, .6 in the build and .68 from the drop on. Pluck accents .5/.28/.38/.28 became .7/.4/.54/.4; bell .3 -> .44; lead .2/.1 -> .3/.15.
- Stems, v1 -> v2 (peak dBFS): kick 0.0 -> -2.6, music -7.6 -> -5.4, bell -15.1 -> -11.9, drums and bass unchanged; RMS kick -13.0 -> -16.4, music -26.3 -> -24.0. Kick-to-music RMS gap 13.3 dB -> 7.6 dB.
- Master v2: -14.1 LUFS, -1.4 dBTP, LRA 7.6 (was 11.9), null test -34.6 dB, four kicks in every bar of 9-48 and 73-148. Spectrum file re-made from it and the video re-rendered (8,633 frames).
- v1 was already submitted to DistroKid by Joona before v2 existed; v2 sits beside it in the release folder (`3 - VERSION 2 ...`) and the submitted files are untouched. Replacing a live song's audio needs DistroKid's Ultimate plan (as the upload form states) or a takedown and re-upload: his call.
- The live sum still peaks over full scale (+1.7 dBFS); only the master is clean.

RSI: ~12 min, 1 capture, 1 render -> top loss: one cancelled capture when the first note was withdrawn (~2 min) -> none: his ears decide, cheap to redo.

## ITER-037 (2026-11-21): track 12 stage 1, kick + bass
- **Asked:** a John Summit-style tech / bass house track.
- **Done:** `patterns/live.strudel.js` on branch `track-12-tech-house` (cut from `track-11-night-shift`, which holds the stem and video tools and is not in `main` yet). 127 BPM, G minor. Only two parts: a 909 kick and a 2-bar 16th-note bassline that never lands on the kick (sine sub + driven saw an octave up, ducked by the kick through `duckorbit`).
- **Why this order:** the Slow Light lesson (ITER-029): start from the part that carries the style, alone, and wait for Joona's ears. In tech house that part is the bass, not chords.
- **Verified:** live page playing, no eval error, cps 0.529 (127 BPM); per 2 bars: 8 kicks (orbit 9), 14 sub + 14 saw notes (orbit 3), first notes G1 on 16ths 1, 3, 6, 9.
- **Not verified:** how it sounds. No audio measurement at this stage; that is his call.
- RSI: 1 save, 1 check -> nothing lost -> none needed.

## ITER-038 (2026-11-21): track 12 restarted, Salvatore Ganacci-style bounce
- **Asked:** "more Salvatore Ganacci now. Let's scrap this one." The Summit-style rolling bass (ITER-037) is gone from `patterns/live.strudel.js`; it stays in git at 5f5cbc8.
- **Done:** 126 BPM, A minor, still only two parts. A 909 kick and one off-beat "donk" that is bass and hook at once: 4 bars of 16ths, octave jumps, a small fill at the end of each bar (FM sine with a pitch drop into every note via `penv`, plus a hollow square an octave up).
- **Verified:** live page playing, no eval or console error, cps 0.525 (126 BPM); per 4 bars: 16 kicks (orbit 9), 27 donk + 27 square notes (orbit 3); bar 1 = A1 on 16ths 2, 6, 10, A2 on 7, 13, then G2, E2.
- **Check mistake caught:** the first two checks queried cycles 0 to 4 and still showed the old pattern, because launch quantization (`// @q 4`) keeps the old pattern for every cycle before the switch point. A live check must query from the scheduler's current cycle onward (`scheduler.now()`), never from cycle 0.
- **Not verified:** how it sounds; his call.
- RSI: 1 save, 4 checks (2 wasted on the cycle-0 query) -> the wasted checks -> query from `scheduler.now()` from here on.

## ITER-039 (2026-11-21): track 12 third start, deadmau5 x John Summit with a melody and a 16-bar progression
- **Asked:** "Go back for the dead mouse. I think dead mouse and john summit. Synth melody, progression, and get rid of the boring repetition", plus a pasted brief on both artists (mau5: detuned saw pluck, patience, chords borrowed from the parallel major; Summit: rolling tech-house bass under a soaring melodic hook). The Ganacci bounce (ITER-038) is gone from the live file; it stays in git at 9fd8f0c.
- **Done:** 127 BPM, G minor, four parts (kick, bass, pluck, lead), no hats or clap yet.
  - Progression, 16 bars, 2 bars a chord: Gm9, Ebmaj9, Bbmaj9, Fsus4 -> F, then Cmaj9 (borrowed from G major, the bittersweet lift), Ebmaj9, Bb/D, Dsus4 -> D major (leads home).
  - Melody, 16 bars, no bar repeated: bars 1 to 8 ask, bars 9 to 16 answer higher and land on F# over the D major.
  - Bass: Summit-style 16ths off the kick, follows every chord, two rhythms alternating, fills on root, fifth and octave.
  - Pluck: the Slow Light pluck, two rhythms alternating, filter breathing over the 16 bars.
- **Bug caught before commit:** the first bass fills used -2 and +3 semitone offsets, which gave Gb over Eb and Ab over Bb (outside G minor). Found by checking every bass note against its bar's chord; fills now use only root, fifth, octave. After the fix: 112 bass notes in 16 bars, all in key (the only non-chord tone is A over Bb/D, the major 7th).
- **Verified:** live page playing, no eval or console error, cps 0.529 (127 BPM); per 16 bars: 64 kicks, 112 sub + 112 saw bass notes, 44 lead notes, 16 of 16 lead bars distinct, 14 of 16 bass bars distinct. Queried from the scheduler's current cycle (ITER-038 lesson).
- **Not verified:** how it sounds; his call.
- RSI: 2 saves, 2 checks -> 1 save spent on out-of-key fills -> note-against-chord check now run on the first save of any bass or melody.

## ITER-040 (2026-11-21): track 12 restarted from the synths, deadmau5 x John Summit
- **Asked:** "restart and use the new info i gave you. Deadmau5 synths are so unique and really carry, they convey the emotion." The brief: the detuned saw pluck, patient pacing, chords borrowed from the parallel major for a bittersweet lift (Strobe, I Remember).
- **Done:** the ITER-039 sketch is replaced (still in git at 9b28917). Stage 1 is synths only, no kick and no bass, as the Slow Light restart taught. 128 BPM, E minor, 16 bars:
  - Chords: Em9, Cmaj9, Gmaj9, D/F#, then E major add9 (borrowed from E major: G# against the first half's G is the lift), Cmaj9, Am9, Bsus4 -> B7 (leads home to Em).
  - The mau5 pluck, arpeggiated through each chord: two detuned saws, resonant ladder filter with a snap-shut envelope on every note, base cutoff opening and closing over 32 bars, two arp shapes alternating, pumping gains, ping-pong pan, dotted delay.
  - A glassy square an octave up on each quarter beat.
  - A five-saw pad that swells, filter rising over the 16 bars, big room.
- **Verified:** live page playing, no eval or console error, cps 0.533 (128 BPM); per 16 bars: 256 pluck, 64 glass, 78 pad notes; 0 notes outside their bar's chord (checked note by note, the ITER-039 rule); 14 of 16 pluck bars distinct (bars repeat only where a chord holds 2 bars with the same arp shape).
- **Not verified:** how it sounds; his call.
- RSI: 1 save, 1 check -> nothing lost -> none needed.

## ITER-041 (2026-11-21): track 12 drums cooked live, then arranged synths-first
- **Asked:** "this is it, open the dashboard so i can see you cook live", then: "start with the melody first ... the synths first. Then we can add the drums later ... open it up with this airy, ethereal, atmospheric [sound] ... as it progresses, when we want to bring the energy, then we layer on top the drums."
- **Done:** dashboard opened in his browser (the app's preview pane muted so he doesn't hear it twice). Drums cooked in three saves: (1) 909 kick ducking the pluck and pad; (2) clap on 2 and 4, shuffled 16th hats, off-beat open hat; (3) a rim pattern that changes every bar of 4, an 808 shaker, a tom fill every 4th bar, a crash at the top of each 16. Then `// @top` and an 80-bar arrangement, 16 bars per section: air (pad, quiet glass, pluck filtered 300 -> 700 Hz) · bloom (pluck 700 -> 1400, still no drums) · pulse (soft kick + shaker, 1400 -> 1900) · groove (kick up, clap, hats, rims, toms, 1900 -> 2400) · full (everything + crash, 2400 -> 3000). The pluck is now a function of its cutoff sweep so each section opens it further.
- **Verified:** no eval error at any save. Because the muted pane no longer evaluates pushes, checks now fetch `/patterns/live.strudel.js` and evaluate it in the pane without playing (`repl.evaluate(code, false)`). Per section: air and bloom have 0 drum events; pulse 64 kicks + 128 shaker; groove adds 32 claps, 256 hats/shaker, 76 rims, 16 toms; full adds 64 open hats and 1 crash. Pluck cutoff measured at 300, 700, 1400, 1900, 2400 Hz at each section start and 2998 at bar 80. 0 notes outside their bar's chord across all 80 bars.
- **Not verified:** how it sounds in his browser; his listen.
- RSI: 4 saves, 5 checks -> 1 check lost to the muted pane not evaluating -> checks now evaluate the saved file themselves.

## ITER-042 (2026-11-21): track 12 bass
- **Asked:** "Yes, add bass. this is beautiful."
- **Done:** a bass that follows all eight chords (roots E, C, G, F# under D/F#, E, C, A, B). Bloom: a long sine root per bar swelling in under the air. Pulse, groove, full: a John Summit-style rolling line of 16ths off the kick, on roots with a chord tone (the 5th, or A over F#) and an octave as the fills, two fill rhythms alternating. Sine for the weight plus a driven saw an octave up; quiet and dark in pulse (cutoff 260 Hz), standard in groove, brighter in full (520 Hz). The kick now ducks the bass too (`duckorbit("2:3:5")`).
- **Bug caught before commit:** one fill landed on 16th 12, beat 4, on top of the kick (48 notes across the three bass sections). Found by checking every bass onset against the quarter-note grid; moved to 16th 11. After: 0 bass notes on a kick.
- **Verified:** no eval error; bass notes per section: air 0, bloom 16, pulse/groove/full 256 each; 0 notes outside their bar's chord across all 80 bars.
- **Not verified:** how it sounds; his listen.
- RSI: 2 saves, 2 checks -> 1 save spent on the beat-4 fill -> bass-on-kick check now runs with the chord check on every bass save.

## ITER-043 (2026-11-21): track 12 melody lead
- **Asked:** "Add melody lead."
- **Done:** a 16-bar melody over the progression, every note a chord tone, 3-3-2 phrasing. Bars 1-8 ask and rest on F# over D/F#; bars 9-16 answer: G# over the borrowed E major is the high point (B5), G natural over C turns it back to minor, D# over B7 pulls home to E. Three voices: a soft FM bell far away in the bloom (the first time it is heard, about 30 s in), the deadmau5 saw lead (three detuned saws, slow vibrato, soft filter attack, dotted delay) in the groove, and the lead plus an octave-up triangle shimmer in the full section. The kick ducks the melody bus lightly too (`duckorbit("2:3:4:5")`).
- **Verified:** no eval error; 41 melody notes per 16 bars: bloom 41 bell, groove 41 lead, full 41 lead + 41 shimmer, none in air or pulse; 0 notes outside their bar's chord across all 80 bars; 15 of 16 lead bars distinct by pitch (bars 11 and 14 share G E B in different rhythms).
- **Not verified:** how it sounds; his listen.
- RSI: 1 save, 1 check -> nothing lost -> none needed.

## ITER-044 (2026-11-21): track 12 "Aura" finished: breakdown, build, drop, outro
- **Asked:** "Yes, breakdown + drop", then "yeah finish it you clearly have the vision."
- **Done:** 152 bars (~4:45): air 16 · bloom 16 · pulse 16 · groove 16 · full 16 · breakdown 16 (drums out; drone, bell, a soft lead, the pluck closing 2600 -> 800 Hz) · build 8 (a 909 snare roll doubling every 2 bars, a white-noise riser, the pluck tearing open 900 -> 4200 Hz, then half a bar of silence) · drop 16 (everything, brightest) · drop II 16 (the bell returns an octave up over the lead, pluck 3800 -> 4400) · outro 16 (drums thin, the pluck closes to 300 Hz). Named "Aura" from Joona's own word for the opening; saved as `patterns/12-aura.strudel.js`.
- **Verified:** no eval error; 0 notes outside their chord across 152 bars; 0 events in the half bar before the drop; kicks per section 0, 0, 64, 64, 64, 0, 0, 64, 64, 64; 41 bell notes in drop II, none in drop I.
- RSI: 3 saves, 3 checks -> nothing lost -> none needed.

## BUG-015 (2026-11-21): stem capture missed orbits 5-8, and the mixer would have mastered without them
- **Symptom (caught before any render):** "Aura" puts its pad on orbit 5. The live page's stem capture recorded only orbits 1, 2, 3, 4 and 9, so the pad would have been missing from every stem, and `tools/mix_live.py` builds the master from the stems: the master would have had no pad. Tracks 09 and 10 also use orbits 5-8.
- **Root cause:** `STEMS` in `tools/live/index.html` listed fixed orbits, and the mixer printed the null test without acting on it, so a missing bus could pass silently.
- **Fix:** a seventh stem, `other`, sums orbits 5-8 (12 channels now); the mixer reads it (high-pass 120 Hz, into the mix bus) and now stops with "the stems do not add up to the mix" when the null test is worse than -20 dB. Channel count is derived from the layout.
- **Proof the check works:** a synthetic capture with the pad in the master but not in the stems stops at null -3.0 dB, "nothing mixed"; the complete one passes the gate (null -148.9 dB). Slow Light's real captures nulled at -33 to -35 dB, well inside the gate.
