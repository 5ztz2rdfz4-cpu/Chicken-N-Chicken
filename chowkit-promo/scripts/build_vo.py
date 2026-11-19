"""Trim the per-line TTS clips, lay them on one timeline and write vo_<lang>.wav + timeline_<lang>.json.

The timeline JSON is the single source of truth for scene timing in the HTML renderer:
each segment has start/end plus 'phrases' (start times of each spoken phrase, split on pauses).
"""
import json, re, subprocess, sys

BUILD = sys.argv[1]
LANG = sys.argv[2]
ORDER = ["hook", "intro", "main1", "main2", "cta1", "cta2"]
START = 0.30          # first word at 0.3 s — hook lands immediately
GAPS = {"intro": 0.28, "main1": 0.32, "main2": 0.28, "cta1": 0.32, "cta2": 0.36}
TAIL = 1.50           # logo hold after last word
SR = 48000


def silences(fn):
    out = subprocess.run(["ffmpeg", "-v", "info", "-i", fn, "-af", "silencedetect=n=-40dB:d=0.16",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", out)]
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                         "-of", "csv=p=0", fn]))
    return list(zip(st, en + [dur] * (len(st) - len(en)))), dur


meta = json.load(open(f"{BUILD}/vo/{LANG}_meta.json"))
segs, inputs, filters = {}, [], []
t = START
for i, key in enumerate(ORDER):
    fn = f"{BUILD}/vo/{LANG}_{key}.mp3"
    sil, dur = silences(fn)
    a = sil[0][1] if sil and sil[0][0] < 0.01 else 0.0                     # leading silence end
    b = sil[-1][0] if sil and sil[-1][1] >= dur - 0.02 else dur              # trailing silence start
    a = max(0.0, a - 0.03); b = min(dur, b + 0.08)
    if i:
        t += GAPS[key]
    phrases = [t] + [t + (e - a) - 0.02 for s, e in sil if a + 0.05 < s and e < b - 0.05]
    segs[key] = {"start": round(t, 3), "end": round(t + b - a, 3), "text": meta[key]["text"],
                 "phrases": [round(p, 3) for p in phrases]}
    inputs += ["-i", fn]
    ms = int(round(t * 1000))
    filters.append(f"[{i}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,aresample={SR},"
                   f"afade=t=in:d=0.02,afade=t=out:st={b - a - 0.06:.3f}:d=0.06,adelay={ms}|{ms}[v{i}]")
    t += b - a

total = round(t + TAIL, 3)
mix = "".join(f"[v{i}]" for i in range(len(ORDER)))
fc = ";".join(filters) + f";{mix}amix=inputs={len(ORDER)}:normalize=0,apad,atrim=0:{total}[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[out]",
                "-ac", "2", "-ar", str(SR), f"{BUILD}/vo_{LANG}.wav"], check=True)
json.dump({"lang": LANG, "total": total, "segments": segs}, open(f"{BUILD}/timeline_{LANG}.json", "w"),
          indent=1, ensure_ascii=False)
for k in ORDER:
    print(LANG, k, segs[k]["start"], "->", segs[k]["end"], "phrases", segs[k]["phrases"])
print(LANG, "TOTAL", total)
