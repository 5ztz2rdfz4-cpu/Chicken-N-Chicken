# Chicken N Chicken — 9:16 promo (40s)

Final video: `../output/ChickenNChicken_Promo_9x16.mp4` (1080×1920, 30fps, H.264 + AAC, -14 LUFS).

## Rebuild
1. `npm install` (GSAP) in this folder.
2. Visuals: `node render.js ../output/video_silent.mp4` — renders `index.html` frame by frame.
3. Voiceover: lines in `audio/lines.txt`, generated with edge-tts voice `ms-MY-YasminNeural` (`--rate=+10% --pitch=+2Hz`), silence-trimmed and placed at 0.30 / 5.20 / 13.10 / 20.10 / 23.55 / 26.65 / 30.00 s.
4. Music + SFX: `python3 audio/music.py <outdir>` (synthesised, royalty-free).
5. Mix: music ducked under VO with sidechain compression, loudness-normalised to -14 LUFS.

Storefront photo has licence plates blurred. The Taman Mini scene uses an illustration (labelled "Ilustrasi") since no garden photo was supplied.
