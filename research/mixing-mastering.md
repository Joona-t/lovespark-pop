# Mixing and mastering: what the research says, and what our chain does (2026-11-21)

Asked by Joona after hearing Aura: "it's not mastered correctly then, do some mixing and mastering research."

## Findings

| Question | Finding | Strength | Source |
|---|---|---|---|
| Spectral shape of commercial records | Long-term spectrum falls about 5 dB per octave from 100 Hz to 4 kHz, steeper above, severe low cut near 60 Hz. Electronic: log-log spectral slope -0.746 (flattest, brightest of the genres), extended low end. Spectra got flatter and louder over the decades. | Peer-reviewed, 772 chart number ones | Pestana, Ma, Reiss, Barbosa, Black, "Spectral Characteristics of Popular Commercial Recordings 1950-2010", AES 135 (2013), paper 8960, Fig. 1, Fig. 5, Table 2 |
| How loud dance records are mastered | 10 top-charting dance/electronic songs (March 2025): integrated -6.2 to -11.3 LUFS, average -8.3; LRA average 6.6 (2024 chart 5.5); John Summit "Focus" -7.0 LUFS, LRA 5.4, -0.28 dBTP; one PLR given: 7.5 dB. | Vendor measurement, small sample | iZotope, "A LUFS and tonal analysis of 10 top-charting dance and electronic songs" (2025) |
| Streaming loudness | Platforms normalise: Spotify -14 LUFS (-1 dBTP, -2 recommended for loud masters), Apple -16. AES TD1008 (2021) recommends -16 LUFS for music distribution; true-peak ceilings of -1 to -3 dBTP are argued (lossy codecs overshoot). Loud masters are turned down, not penalised further. | Standards body + platform docs (secondary write-ups; TD1008 tables not read in full) | AES TD1008; Production Expert; Production Advice |
| Low end | Kick and bass mono below about 120 Hz (sources range 120-250 Hz); bass mids can stay wide. Sidechain the bass (and pads) from the kick. | Practitioner consensus | Armada Music University; Mastering The Mix; Mixed In Key |
| Automatic mixing | Knowledge-engineered rule mixers perform comparably to human engineers in listening tests; level balance within subgroups first. | Peer-reviewed | De Man & Reiss, AES 135 (2013); Shi, Xie, Ma, Reiss (AES 2025) |
| Untested / open | No peer-reviewed number for hi-hat level relative to kick in house music was found; balance stays an ear decision. | Gap | - |

## Our master measured against it (Aura A, before the fixes)

- Slope -0.55 in the drop vs -0.746: too bright; air (6-16 kHz) 2.3 dB louder than presence (2-6 kHz), the "tick tick tick" Joona heard.
- Crest factor 14.5 dB, LRA 9.8 at -14 LUFS: far more dynamic and quieter than the genre (LRA 5-6, -8.3 LUFS).

## What changed

1. Mix: hats 16 -> 8 per bar and quieter, shaker halved (the tick).
2. Master chain (`tools/mix_live.py`): mono below 120 Hz (4th-order crossover) -> match EQ toward the -0.746 slope (third-octave bands, line fitted by least squares, cut <= 3 dB, boost <= 2 dB) -> glue compressor (2:1, -20 dB, 30/180 ms) -> soft clip -> 4x oversampled limiter -> main master at -9 LUFS, <= -1 dBTP; a -14 LUFS version kept for reference.
3. Test on the old capture: slope -0.62 -> -0.67, master -9.3 LUFS, LRA 5.0, -1.3 dBTP. A first run had the EQ silently disabled (`gain='0'` overrode the entries); caught by measuring asked vs applied gain per band.

## Limits

Strudel has one reverb and delay per bus and no per-bus EQ; ffmpeg's limiter is not a modern true-peak design; and the balance is judged by numbers, not ears. The final mix belongs in Ableton with Joona's ears, starting from the per-bus stems (`renders/<name>.f32`: kick, drums, music, bass, melody, other).
