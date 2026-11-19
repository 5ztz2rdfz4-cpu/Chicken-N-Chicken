# Chicken N Chicken: Weekend Family Promo (9:16)

The final video is `ChickenNChicken_Promo_9x16.mp4`: 1080×1920, 30 fps, about 38.4 s, H.264 + AAC, loudness-normalised for Reels/TikTok (about -14 LUFS).

## Storyboard (timed to the narration)

| Time | Scene | What happens |
|---|---|---|
| 0.0–3.5 | Hook | A "HUJUNG MINGGU" calendar flips in and SAB/AHD light up. The family illustration appears with the words *Weekend Ni Tak Tahu Nak Bawa Family Ke Mana?*, which pop in word by word with the voice. |
| 3.5–9.7 | Hook (needs) | A search bar types *"Tempat makan family best?"*. Three checklist cards slide in on the words *selesa / anak-anak / keluarga*, then all three tick. |
| 9.7–13.7 | Brand intro | A maroon iris wipe and sunburst open the scene. Shows *Jom Singgah*, the logo reveal, *Your Family Weekend Dining Destination*, the real storefront photo and a pin drop on **Kota Warisan, Sepang, Selangor**. |
| 13.7–18.6 | Comfortable dining | The camera zooms through the front door into the restaurant. *Bukan setakat tempat makan tau!* appears, then *Tempat Makan Selesa Untuk Seisi Keluarga* with the dining-hall and booth photos, food icons and a family-at-the-table illustration. |
| 18.6–23.0 | Facilities | **01 Surau Selesa** ("Kemudahan surau yang selesa.") and **02 Playground Kanak-Kanak** ("Anak-anak pun boleh bermain!"), each on its own animated infographic card with the real photo. |
| 23.0–27.7 | Payoff | *Mak Ayah Makan, Anak-anak Main!* The camera pans across the real dining-hall photo from the tables to the playground behind the glass, with a callout for each. |
| 27.7–29.5 | Around Sepang | A stylised map zooms out, the pin drops and a radius circle marks *Sekitar Sepang?* |
| 29.5–33.8 | Weekend list | *Weekend Ini, Luangkan Masa Bersama Keluarga!* A notepad titled "Senarai Port Makan Hujung Minggu" gets *Chicken N Chicken* handwritten in, ticked and stamped. |
| 33.8–38.4 | End card | Logo reveal with a light sweep and sparkles. **KOTA WARISAN · SEPANG, SELANGOR**, *Good Food. Great Family Moments.*, and the family returns. |

## Assets used
- `reference-photos/`: the six images supplied (playground, booths, main dining hall, surau, storefront, logo). Only the facilities and food shown in these photos appear in the video.
- The logo is the supplied artwork. Only the white background was removed (colour-to-alpha), and it is always shown at its original aspect ratio on a white card.
- The family characters, icons, map and music are original. Some UI icons come from Phosphor Icons (MIT).
- Voiceover: Microsoft Azure neural voice **ms-MY-OsmanNeural** (native Malaysian Malay), generated line by line from the supplied script. An alternative female voice (**ms-MY-YasminNeural**) is also scripted, but it runs about 41 s at a natural pace.

## Rebuild
```bash
cd promo/src && npm install            # gsap, @phosphor-icons/core (Playwright + Chromium must be available)
# 1. voice (needs network access to the Edge TTS service)
cd ../voiceover && i=0; while IFS= read -r l; do i=$((i+1)); python3 tts.py ms-MY-OsmanNeural +14% +0Hz "$l" Osman_$i.mp3; done < script_lines.txt
python3 build_vo.py Osman . vo_Osman            # -> vo_Osman.wav + vo_Osman.json (word-level cue sheet)
# 2. picture (every animation is keyed to the word timings in the cue sheet)
cd ../src && node render.js ../voiceover/vo_Osman.json full video_only.mp4 30
# 3. sound (music + SFX are synthesised; SFX times come from sfx.json, which render.js writes)
ffmpeg -i ../voiceover/vo_Osman.wav -af "highpass=f=85,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:makeup=2" vo_proc.wav
python3 audio.py vo_proc.wav ../voiceover/vo_Osman.json sfx.json mix_raw.wav
ffmpeg -i mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:LRA=9" mix.wav
ffmpeg -i video_only.mp4 -i mix.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart ChickenNChicken_Promo_9x16.mp4
```
To preview single frames, run `node render.js <cues.json> preview 3.3,9.2,13.4 <outdir>`.
