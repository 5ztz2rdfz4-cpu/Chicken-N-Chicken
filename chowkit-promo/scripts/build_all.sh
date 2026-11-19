#!/usr/bin/env bash
# Full pipeline: VO → timeline → frames → audio → final MP4 (per language).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/vo output
python3 scripts/crops.py assets/photos assets/crops
for L in ${@:-bm en}; do
  python3 scripts/vo.py build/vo "$L"
  python3 scripts/build_vo.py build "$L"
  node scripts/render.js "$L" "build/video_$L.mp4"
  python3 scripts/make_audio.py build "$L"
  python3 scripts/mux.py "$L"
done
