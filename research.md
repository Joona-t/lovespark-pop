# Research (2026-11-19)

## 1. How Claudia is made (claudia.gallery)
Ten music videos made with Claude, September to November 2026. The method is public: recipe (claudia.gallery/wiki/recipe.md), toolkit spec (wiki/toolkit.md), a kit, an MCP server, llms.txt.

- **Character:** fixed head (black bob, one clay-orange streak #D97757, star clip, headset mic), clothes change per world. A face-on reference sheet goes in as the second image of every take that shows her; first frames are made from the sheet plus a fixed identity paragraph. Midjourney stopped holding her face, so it was kept for worlds only. Country/ethnicity words in prompts changed her face.
- **Song:** Suno v6. Lyric scored first (hooks 6-7 syllables, verse lines 10-13), 2-3 rounds of takes, picked by ear. Stem split; each sung line's start/end read from the lead stem's level, not speech recognition (recognisers placed words up to 2 s early).
- **Motion and lip sync:** Seedance 2.5 with the lead-vocal stem as audio input, cut to the take (4-15 s, ~0.7 s lead-in silence). Sync by dynamic time warping, because the model stretches pauses and sings 10-16% slow. Take audio is discarded; the song is laid back over.
- **Edit:** code draws lyrics, HUDs, desktops, shader worlds; cuts on the bar map; master to about -14 LUFS; flash check; 9:16 cut.
- **Review:** one contact sheet per shot, two fresh reviewers, then the person watches v1. Six human checkpoints (concept, song take, face, board, cost, v1).
- **Cost:** $93-435 per film on the video model alone, all paid API. Not usable for us.

## 2. DJ_Dave and Strudel
DJ_Dave live-codes hyperpop and electronic pop. Started in Sonic Pi (Ruby, from the 2020 lockdown), moved to Strudel; arranges in Logic.
Sources: lucidmonday.com/blog/digital-cover-dj-dave, wypr.org 2026-10-05, magneticmag.com 2022-04.

Strudel: JavaScript port of TidalCycles, runs in the browser, built-in synths and a sampler, OSC out to SuperCollider/SuperDirt. Local: `pnpm i && pnpm dev` (Node 18+). Licence AGPL-3.0 (codeberg.org/uzu/strudel): our pattern code is shared under AGPL; the audio we make is ours. Bundled sample packs have mixed licences, so we use our own samples. Audio export from Strudel itself: [unverified]; plan is to record it from headless Chromium.

## 3. Local replacements (licences from secondary sources, to be checked on official repos)
| Step | Claudia | Ours |
|---|---|---|
| Lyrics, prompts, code | Claude | Qwen 3.8 27B on the Forge, Claude Code |
| Beats, arrangement | Suno | Strudel patterns |
| Sung vocals | Suno | ACE-Step 1.5 (MIT per its authors), YuE (Apache 2.0); YuE2 licence unconfirmed |
| Character, worlds | Midjourney, GPT Image | Qwen-Image + our character LoRA, TRELLIS, Blender, shaders |
| Lip sync | Seedance 2.5 | InfiniteTalk (Apache 2.0, FP8 fits one 24 GB card); Wan2.2-S2V (Apache 2.0, 80 GB official, quantized builds smaller). Not Wav2Lip (non-commercial). MuseTalk licence conflicting (MIT vs OpenRAIL-M). |
| Word timing | stem level | same method; faster-whisper on a Forge card as a cross-check |
