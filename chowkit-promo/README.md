# Chicken N Chicken — Chow Kit promo (9:16)

Final videos (1080×1920, 30 fps, H.264 + AAC, −14 LUFS):

| File | Language | Length |
|---|---|---|
| `output/ChickenNChicken_ChowKit_BM_9x16.mp4` | Bahasa Melayu (main) | 39.5 s |
| `output/ChickenNChicken_ChowKit_EN_9x16.mp4` | English | 37.5 s |

## How it's made
- **Voice-over**: Microsoft neural TTS. BM uses `ms-MY-YasminNeural` (Malaysian Malay), EN uses `en-SG-LunaNeural` (closest regional English accent). Script lines are in `scripts/vo.py`.
- **Visuals**: `src/index.html`. Motion-graphic scenes styled after the Sepang reference (cream/maroon/orange, Poppins, framed photos, pin and notebook). Each scene is timed to the spoken phrases (`build/timeline_<lang>.json`).
- **Imagery**: only the two supplied photos (storefront + counter) and the supplied logo. The food close-ups are crops of the real banner on the storefront.
- **Music & SFX**: original, synthesised in `scripts/make_audio.py`, so there are no licensing issues. Music ducks under the voice.

Rebuild everything: `scripts/build_all.sh` (or `scripts/build_all.sh bm`).
Needs ffmpeg, Node and Playwright Chromium, Python with numpy, scipy, Pillow and edge-tts.
