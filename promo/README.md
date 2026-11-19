# Chicken N Chicken — 9:16 promo (37s)

Final video: `../output/ChickenNChicken_Promo_9x16_v2.mp4` (1080×1920, 30fps, H.264 + AAC, -14 LUFS).

## Rebuild
1. `npm install` (GSAP) in this folder.
2. Visuals: `node render.js ../output/video_silent.mp4` — renders `index.html` frame by frame.
3. Voiceover: lines in `audio/lines.txt`, generated with edge-tts voice `ms-MY-YasminNeural` (`--rate=+10% --pitch=+2Hz`), silence-trimmed and placed at s1 0.30, s2 5.20, s3 13.10, s4a 20.10, s4c 23.75, s5 27.10 s.
4. Music + SFX: `python3 audio/music.py <outdir>` (synthesised, royalty-free).
5. Mix: music ducked under VO with sidechain compression, loudness-normalised to -14 LUFS.

Storefront photo is cropped to the restaurant frontage (no parked cars). Facilities shown: Surau Selesa and Playground Kanak-Kanak.
