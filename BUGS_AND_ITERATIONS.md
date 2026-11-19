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
