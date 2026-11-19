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
