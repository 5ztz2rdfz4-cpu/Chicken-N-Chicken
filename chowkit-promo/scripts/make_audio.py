"""Original procedurally-synthesised music bed + SFX, then final mix with the voice-over.

usage: python3 make_audio.py <build_dir> <lang>
reads  build/vo_<lang>.wav, build/timeline_<lang>.json, build/sfx_<lang>.json
writes build/music_<lang>.wav, build/sfx_<lang>.wav, build/mix_<lang>.wav
"""
import json, subprocess, sys
import numpy as np
from scipy.signal import lfilter, fftconvolve, butter, sosfilt

BUILD, LANG = sys.argv[1], sys.argv[2]
SR = 48000
TL = json.load(open(f"{BUILD}/timeline_{LANG}.json"))
TOTAL = TL["total"]
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(11)


def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=.003, k=8.0):
    t = tt(d); e = np.exp(-k * t); n = max(1, int(a * SR)); e[:n] *= np.linspace(0, 1, n); return e
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, fc, order=2): return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def saw(f, d, det=0.0):
    t = tt(d); return 2 * ((t * f * (1 + det)) % 1) - 1
def add(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x), 0] += x * g * (1 - max(0, pan))
    buf[i:i + len(x), 1] += x * g * (1 + min(0, pan))


# ------------------------------------------------------------------ instruments
def kick():
    d = .38; t = tt(d); f = 48 + 110 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) + .3 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300)
def clap():
    d = .25; x = bp(rng.standard_normal(int(d * SR)), 900, 5000); e = np.zeros_like(x); t = tt(d)
    for o in (0, .011, .022): e += (t >= o) * np.exp(-np.clip(t - o, 0, None) * (60 if o < .02 else 18))
    return x * e * .6
def hat(open_=False):
    d = .22 if open_ else .05; x = hp(rng.standard_normal(int(d * SR)), 7000)
    return x * env(d, .001, 14 if open_ else 80) * .24
def shaker():
    d = .07; return bp(rng.standard_normal(int(d * SR)), 4000, 11000) * env(d, .012, 45) * .14
def bass(m, d):
    f = hz(m); x = .6 * saw(f, d) + .4 * np.sin(2 * np.pi * f * tt(d))
    return lp(x, 900) * env(d, .004, 5) * .55
def pluck(m, d=.32):
    f = hz(m); x = saw(f, d, .004) + saw(f, d, -.004) + .5 * saw(f * 2, d)
    return lp(x, 2600) * env(d, .002, 11) * .12
def mallet(m, d=.45):
    f = hz(m); t = tt(d)
    return (np.sin(2 * np.pi * f * t) + .28 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 30)) * env(d, .001, 9) * .22
def pad(ms, d):
    x = sum(saw(hz(m), d, .003) + saw(hz(m), d, -.003) for m in ms)
    e = np.minimum(1, tt(d) / .25) * np.minimum(1, (d - tt(d)) / .3)
    return lp(x, 1400) * e * .025


# ------------------------------------------------------------------ music (D major, I–V–vi–IV, 116 BPM)
def music():
    bpm = 116; beat = 60 / bpm; bar = 4 * beat
    out = np.zeros((N, 2))
    prog = [(50, [62, 66, 69]), (57, [61, 64, 69]), (59, [62, 66, 71]), (55, [62, 67, 71])]  # D A Bm G
    mel = [[74, 78, 81, 78, 76, 74, 76, 78], [76, 73, 76, 81, 80, 76, 73, 76],
           [78, 74, 78, 83, 81, 78, 74, 78], [79, 74, 79, 83, 81, 79, 76, 74]]
    end_hit = TOTAL - 1.55
    nbars = int(end_hit / bar) + 1
    for b in range(nbars):
        t0 = b * bar; root, ch = prog[b % 4]
        intro = b == 0
        add(out, pad(ch, bar), t0, 1.0)
        for i in range(8):                                   # 8th-note grid
            t = t0 + i * beat / 2
            if t >= end_hit: break
            if not intro:
                if i % 2 == 0: add(out, kick(), t, .95)
                if i in (2, 6): add(out, clap(), t, .55)
                add(out, hat(open_=(i % 2 == 1)), t, .7 if i % 2 else .45, .25)
                add(out, bass(root + (12 if i in (3, 7) else 0), beat / 2 * .9), t, 1.0)
            if i in (1, 3, 4, 6):
                for k, m in enumerate(ch): add(out, pluck(m), t, 1.0, (k - 1) * .35)
            if (b % 2 == 1 or intro) and i in (0, 2, 3, 5, 6):
                add(out, mallet(mel[b % 4][i]), t, .9 if not intro else .6, -.2)
        for i in range(16):                                  # shaker 16ths
            t = t0 + i * beat / 4
            if t < end_hit and not intro: add(out, shaker(), t, .8 if i % 4 == 2 else .45, .4)
    # final hit: D major stab + mallet arpeggio ring-out
    for k, m in enumerate([50, 62, 66, 69, 74]): add(out, pluck(m, 1.4) * 1.4, end_hit, 1.0, (k - 2) * .2)
    add(out, kick(), end_hit, 1.0); add(out, clap(), end_hit, .5)
    for k, m in enumerate([74, 78, 81, 86]): add(out, mallet(m, 1.2), end_hit + k * .07, .8)
    add(out, pad([62, 66, 69, 74], 1.5), end_hit, 2.0)
    # light reverb on the whole bed
    ir_t = tt(1.1); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 5.5); ir = lp(ir, 5000); ir /= np.abs(ir).sum() / 6
    for c in range(2): out[:, c] = out[:, c] + .18 * fftconvolve(out[:, c], ir)[:N]
    fade = np.ones(N); i0 = int((TOTAL - .25) * SR); fade[i0:] = np.linspace(1, 0, N - i0).clip(0)
    out *= fade[:, None]
    return out


# ------------------------------------------------------------------ SFX
def sweep_noise(d, f0, f1, bands=10):
    """Noise whose spectral centre glides f0→f1: crossfade between fixed log-spaced band-passes (click-free)."""
    n = int(d * SR); x = rng.standard_normal(n); p = np.linspace(0, 1, n)
    cs = np.geomspace(f0, f1, bands); out = np.zeros(n); pos = p * (bands - 1)
    for k, c in enumerate(cs):
        w = np.clip(1 - np.abs(pos - k), 0, 1)
        out += bp(x, max(40, c / 1.5), min(20000, c * 1.5)) * w
    return out
def sfx(kind, dur):
    if kind == 'pop':
        d = .09; t = tt(d); f = 380 + 900 * t / d
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, .002, 40) * .7
    if kind == 'tick':
        d = .03; return np.sin(2 * np.pi * 2300 * tt(d)) * env(d, .0005, 160) * .4
    if kind == 'key':
        d = .025; return hp(rng.standard_normal(int(d * SR)), 2500) * env(d, .0005, 220) * .5
    if kind in ('whoosh', 'swish'):
        d = .55 if kind == 'whoosh' else .32
        x = sweep_noise(d, 300, 4500 if kind == 'whoosh' else 7000); t = tt(d)
        e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
        return x * e * (.55 if kind == 'whoosh' else .35)
    if kind == 'tap':
        d = .12; t = tt(d); return (np.sin(2 * np.pi * 220 * t) * np.exp(-t * 40) + .4 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200)) * .6
    if kind == 'stamp':
        d = .35; t = tt(d); f = 70 + 80 * np.exp(-t * 25)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) + .5 * lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 35)) * .9
    if kind == 'drop':
        d = .22; t = tt(d); f = 1400 * (450 / 1400) ** (t / d)
        w = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .02) * .25
        return np.concatenate([w, sfx('pop', 0) * .8])
    if kind == 'ding':
        d = .9; t = tt(d); return (np.sin(2 * np.pi * 1760 * t) + .4 * np.sin(2 * np.pi * 3520 * t) * np.exp(-t * 6)) * env(d, .001, 5) * .3
    if kind == 'chime':
        out = np.zeros(int(1.6 * SR))
        for k, m in enumerate([86, 90, 93, 98]):
            d = 1.2; t = tt(d); x = (np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(2 * np.pi * hz(m) * 2.76 * t) * np.exp(-t * 8)) * env(d, .001, 4) * .22
            i = int(k * .06 * SR); out[i:i + len(x)] += x
        return out + sweep_noise(1.6, 6000, 12000, 4) * np.exp(-tt(1.6) * 3) * .06
    if kind == 'whirl':
        out = np.zeros(int(dur * SR) + 2000)
        for k in range(int(dur / .09)): x = sfx('tick', 0); i = int(k * .09 * SR); out[i:i + len(x)] += x * (.6 + .4 * (k % 2))
        return out
    if kind == 'sizzle':
        n = int(dur * SR); x = hp(rng.standard_normal(n), 5000) * .05
        imp = (rng.random(n) < 0.0016) * rng.standard_normal(n) * 2.2
        x += hp(lfilter([1], [1, -.6], imp), 2500)
        e = np.minimum(1, tt(dur) / .3) * np.minimum(1, (dur - tt(dur)) / .5); return x * e[:n] * .35
    if kind == 'scribble':
        n = int(dur * SR); x = bp(rng.standard_normal(n), 1800, 6500)
        am = np.abs(np.sin(2 * np.pi * 7 * tt(dur))) ** 2 * (.5 + np.clip(lp(rng.random(n), 15) * 2, 0, 1))
        return x * am[:n] * .18
    raise ValueError(kind)


def write(fn, x):
    x = np.clip(x, -1, 1); pcm = (x * 32767).astype('<i2')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', fn], input=pcm.tobytes(), check=True)


m = music(); m /= np.abs(m).max() / .8
write(f"{BUILD}/music_{LANG}.wav", m[: int(TOTAL * SR)])
fx = np.zeros((N, 2))
for c in json.load(open(f"{BUILD}/sfx_{LANG}.json")):
    add(fx, sfx(c['type'], c['dur']), c['t'], c['gain'])
write(f"{BUILD}/sfx_{LANG}.wav", fx[: int(TOTAL * SR)] * .9)

# final mix: music ducked under VO (sidechain), SFX on top, loudness -14 LUFS / -1 dBTP for social
fc = ("[0:a]volume=1.0,asplit=2[vo][sc];"
      "[1:a]volume=0.30[mus];[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=320:makeup=1[duck];"
      "[2:a]volume=0.55[fx];"
      "[vo][duck][fx]amix=inputs=3:normalize=0,highpass=f=40,loudnorm=I=-14:TP=-1.0:LRA=9[out]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f"{BUILD}/vo_{LANG}.wav", '-i', f"{BUILD}/music_{LANG}.wav",
                '-i', f"{BUILD}/sfx_{LANG}.wav", '-filter_complex', fc, '-map', '[out]', '-ar', str(SR), '-ac', '2',
                f"{BUILD}/mix_{LANG}.wav"], check=True)
print("audio ok", LANG, TOTAL)
