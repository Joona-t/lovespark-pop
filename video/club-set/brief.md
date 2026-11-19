# Club set video: brief and scene list (preview stage)

**The one idea:** a club DJ set in cyberspace. Ash plays "Cyber Space Set" (track 10, 132 bars, 4:11) with her Claudios, the crowd behind the decks, everything moving on the music's own clock.

**Preview:** `python3 tools/live/server.py`, open http://127.0.0.1:4321/club, press START. Not a render: the page plays the set and draws the stage from the scheduler's bar position. `?bar=60` previews a position without audio.

**Frontier references (to compare side by side before the full render):** Boiler Room sets (camera in front of the decks, crowd behind the DJ), Hatsune Miku live shows (a virtual performer on a real-feeling stage), The Weeknd / Gorillaz virtual sets for lighting.

## Scene list (bars are 1-based)
| Bars | Music | Picture |
|---|---|---|
| 1-12 | announcer over the crowd | wide on the booth, crowd cheering with arms and phones up, Ash waving; high room shot on bar 7; close on Ash for the riser |
| 13-28 | plucks, filter opening | wide, low light, crowd swaying, Claudios bobbing gently |
| 29-36 | kick and bass enter | crowd starts bouncing, spots sweep, first cuts |
| 37-52 | bell lead; "six, seven ... can you feel it" from bar 45 | cuts every 4 bars: Ash close, wide, Claudio on the stack, side angle |
| 53-60 | breakdown, snare roll | lights drop, strobe hits follow the roll as it doubles |
| 61-76 | drop | strobe for 2 bars, arms up, Claudios jumping, fastest cuts; Ash throws a hand up every 4th bar |
| 77-92 | B-section, new chords | colour wash alternates, side and high angles |
| 93-100 | half-time bridge | everything bounces at half speed, build into the final drop |
| 101-116 | final drop | as the drop, with the little Claudio on the booth getting his own shot |
| 117-132 | outro | energy winds down, wide shot, lights fade |

## What exists in the preview
Ash (her VRM, hands on the decks, head and body on the beat), three Claudios built in code from his master sheet (two on speaker stacks, a small one on the booth), 54 background dancers, glyph-grid LED wall and booth front, spots, wash, strobe, bloom, six camera angles cut on bar lines.

## Not done yet (after Joona's OK on the look)
- Claudio's real model from ashley-pc (the code-built one is a stand-in), the K-pop cast as extra dancers or co-DJs.
- Crowd as characters instead of capsule figures; outfit and look pass on Ash.
- Full render: frames from `window.club.render(bar)` in headless Chromium on the Forge (one process per GPU), audio from a WAV render of the set, 16:9 at 1080p or 4K; layout and contact-sheet checks; three title and thumbnail pairs.
- Name: "Boiler Room" is a real brand; the public video needs our own name.
