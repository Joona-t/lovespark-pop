# LoveSpark Pop

An open pop character and her music, made with local models only: no paid AI APIs.

- **Music:** live-coded in [Strudel](https://codeberg.org/uzu/strudel) (the TidalCycles port in the browser), the way DJ_Dave works, across progressive house, pop house, electro, techno and hyperpop. Sung vocals from open song models (ACE-Step 1.5 first).
- **Picture:** our own character, drawn with Qwen-Image and a LoRA we train on her, lip-synced with open models (InfiniteTalk first), on the Forge's two GPUs.
- **Method:** studied from [claudia.gallery](https://claudia.gallery/), which publishes its whole recipe. We follow the shape of it (fixed head, changing looks, word timing from the vocal stem, cuts on the bar map), not its character or its paid tools.

See `research.md` for the findings and `plan.md` for the build order.

## Layout
- `patterns/` — Strudel patterns, one file per track (AGPL-3.0, see `patterns/LICENSE`).
- `tools/` — render and pipeline scripts (MIT).

## Licence
MIT for everything except `patterns/`, which is AGPL-3.0. Every model used must allow monetised use; each one's licence is checked on its official repo before its output ships.
