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
