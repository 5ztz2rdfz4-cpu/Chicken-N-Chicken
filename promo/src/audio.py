"""Original soundtrack: synthesized upbeat music bed + SFX + voice mix with sidechain ducking.
Usage: python3 audio.py <voice.wav> <cues.json> <sfx.json> <out.wav>
"""
import sys, json, wave, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
vo_path, cues_path, sfx_path, out_path = sys.argv[1:5]
cues = json.load(open(cues_path)); events = json.load(open(sfx_path))
DUR = cues['total']; N = int(DUR * SR)
rng = np.random.default_rng(42)

def read_wav(p):
    with wave.open(p) as f:
        x = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
        return x.reshape(-1, f.getnchannels()).mean(1)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, fc, order=2): return sosfilt(butter(order, fc, 'lowpass', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, 'highpass', fs=SR, output='sos'), x)
def env(n, a, d):  # attack, exp decay (seconds)
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * g

# ------------------------------------------------------------------ music
BPM = 116; beat = 60 / BPM; bar = 4 * beat
prog = [[60, 64, 67], [55, 59, 62, 67], [57, 60, 64], [53, 57, 60, 65]]  # C  G  Am  F
roots = [36, 43, 45, 41]
L = np.zeros(N + SR * 3); R = np.zeros_like(L)
END_GROOVE = cues['voiceEnd'] + 0.3          # drums stop, final chord rings
DROP_A, DROP_B = cues['lines'][2]['start'] - 0.55, cues['lines'][2]['start'] + 0.05   # tiny break before the brand reveal

def saw(f, n, det=0.0):
    t = np.arange(n) / SR
    ph = (t * f * (1 + det)) % 1.0
    return 2 * ph - 1

def pad_chord(notes, n):
    x = np.zeros(n); y = np.zeros(n)
    for m in notes:
        f = mtof(m)
        x += saw(f, n, -0.004) + 0.6 * saw(f * 2, n, 0.003)
        y += saw(f, n, 0.004) + 0.6 * saw(f * 2, n, -0.003)
    e = np.minimum(1, np.arange(n) / (0.25 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.2 * SR))
    return lp(x, 1500) * e, lp(y, 1500) * e

def pluck(m, d=0.22):
    n = int(0.6 * SR); t = np.arange(n) / SR; f = mtof(m)
    x = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(5))
    return x * env(n, 0.002, d)

def bass_note(m, length):
    n = int(length * SR); t = np.arange(n) / SR; f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.1 * np.sin(2 * np.pi * 3 * f * t)
    return np.tanh(1.6 * x) * env(n, 0.004, length * 0.8)

def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12)

def clap():
    n = int(0.25 * SR); x = bp(rng.standard_normal(n), 900, 4000)
    e = np.zeros(n)
    for o in (0, 0.011, 0.022): e += env(n, 0.0005, 0.012) * (np.arange(n) >= int(o * SR))
    e = np.roll(env(n, 0.0005, 0.07), 0) * 0.6 + e * 0.5
    return x * e

def hat(open_=False):
    n = int((0.18 if open_ else 0.06) * SR)
    return hp(rng.standard_normal(n), 7000) * env(n, 0.0005, 0.06 if open_ else 0.018)

K, C, H, HO = kick(), clap(), hat(), hat(True)
nbars = int(np.ceil(DUR / bar)) + 1
for b in range(nbars):
    t0 = b * bar; ci = b % 4
    if t0 > DUR: break
    final = t0 >= END_GROOVE - bar
    # pad
    plen = bar if not final else (DUR - t0 + 2.0)
    if t0 < END_GROOVE:
        pl, pr = pad_chord(prog[ci], int(min(plen, DUR + 2.5 - t0) * SR))
        add(L, pl, t0, 0.045); add(R, pr, t0, 0.045)
    for s in range(8):  # 8th-note grid
        t = t0 + s * beat / 2
        if t >= END_GROOVE: break
        in_drop = DROP_A <= t < DROP_B
        # pluck arpeggio, pattern up/down
        notes = prog[ci]; seq = [0, 1, 2, 1, 2, 3 % len(notes), 2, 1]
        m = notes[seq[s] % len(notes)] + 12
        pk = pluck(m)
        add(L, pk, t, 0.07 if s % 2 else 0.05); add(R, pk, t + 0.012, 0.05 if s % 2 else 0.07)
        if t < 0.45 or in_drop: continue
        # bass: root pumping on 8ths with octave on offbeats
        bn = bass_note(roots[ci] + (12 if s in (3, 7) else 0), beat / 2 * 0.95)
        add(L, bn, t, 0.16); add(R, bn, t, 0.16)
        if s % 2 == 0:
            add(L, K, t, 0.42); add(R, K, t, 0.42)
        if s in (2, 6):
            add(L, C, t, 0.16); add(R, C, t + 0.006, 0.16)
        hh = HO if s % 2 else H
        add(L, hh, t, 0.05 if s % 2 else 0.03); add(R, hh, t, 0.03 if s % 2 else 0.05)

# final ringing chord + bell on the logo end card
t_end_chord = END_GROOVE
pl, pr = pad_chord(prog[0] + [72], int((DUR + 2 - t_end_chord) * SR))
add(L, pl, t_end_chord, 0.06); add(R, pr, t_end_chord, 0.06)
for i, m in enumerate([72, 76, 79, 84]):
    pk = pluck(m, 0.9); add(L, pk, t_end_chord + i * 0.09, 0.06); add(R, pk, t_end_chord + i * 0.09 + 0.01, 0.06)
bk = bass_note(36, 2.0); add(L, bk, t_end_chord, 0.16); add(R, bk, t_end_chord, 0.16)
add(L, K, t_end_chord, 0.4); add(R, K, t_end_chord, 0.4)

# simple reverb (stereo decorrelated noise IR)
def reverb(x, seed, secs=1.4):
    n = int(secs * SR); r = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR / 0.35)
    r = lp(r, 6000); r /= np.sqrt((r ** 2).sum())
    return fftconvolve(x, r)[: len(x)]
L = L + 0.25 * reverb(L, 1); R = R + 0.25 * reverb(R, 2)
music = np.stack([L[:N], R[:N]], 1)
# fade in/out
fi = int(0.05 * SR); music[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.2 * SR); music[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5

# ------------------------------------------------------------------ SFX
def noise_sweep(dur, f0, f1, rise=True):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fr = i / n; f = f0 * (f1 / f0) ** fr
        out[i:i + seg] = bp(x[max(0, i - 2048):i + seg], f * 0.7, min(f * 1.4, 20000))[-len(x[i:i + seg]):]
    t = np.linspace(0, 1, n)
    e = (t ** 1.6) * np.exp(-(1 - t) * 0) if rise else np.sin(np.pi * t) ** 2
    if rise: e = np.where(t < 0.85, (t / 0.85) ** 2, (1 - t) / 0.15)
    return out * e

def tone(f0, f1, dur, d):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / (dur / 4))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, d)

def make(type_):
    if type_ == 'whoosh': return noise_sweep(0.45, 400, 3500, False) * 0.9
    if type_ == 'whoosh_up': return noise_sweep(0.6, 300, 6000, True) * 0.9
    if type_ == 'swish': return noise_sweep(0.25, 1500, 7000, False) * 0.7
    if type_ == 'pop': return tone(900, 380, 0.12, 0.05) * 0.9 + hp(rng.standard_normal(int(0.01 * SR)), 3000) * 0.2 if False else tone(900, 380, 0.12, 0.05) * 0.9
    if type_ == 'ding':
        n = int(0.9 * SR); t = np.arange(n) / SR
        return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, a, dd in [(1568, 1, .35), (3136, .4, .2), (4704, .2, .1)]) * env(n, 0.001, 10) * 0.6
    if type_ == 'impact':
        n = int(1.4 * SR); t = np.arange(n) / SR
        boom = np.sin(2 * np.pi * np.cumsum(38 + 80 * np.exp(-t / 0.06)) / SR) * np.exp(-t / 0.45)
        crack = lp(rng.standard_normal(n), 3000) * np.exp(-t / 0.05)
        return np.tanh(1.5 * boom) * 0.9 + crack * 0.35
    if type_ == 'shimmer':
        n = int(1.2 * SR); out = np.zeros(n); t = np.arange(n) / SR
        for k in range(18):
            s = int(rng.uniform(0, 0.7) * SR); f = rng.uniform(2500, 7000); m = n - s
            out[s:] += np.sin(2 * np.pi * f * t[:m]) * np.exp(-t[:m] / 0.12) * 0.25
        return out
    if type_ == 'thud':
        return tone(160, 55, 0.3, 0.09) * 0.9 + lp(rng.standard_normal(int(0.3 * SR)), 800) * env(int(0.3 * SR), 0.001, 0.03) * 0.3
    if type_ == 'type':
        n = int(1.0 * SR); out = np.zeros(n)
        for k in range(14):
            s = int((k * 0.065 + rng.uniform(0, 0.015)) * SR); c = bp(rng.standard_normal(int(0.02 * SR)), 2000, 6000) * env(int(0.02 * SR), 0.0005, 0.004)
            out[s:s + len(c)] += c
        return out * 1.6
    if type_ == 'paper': return noise_sweep(0.35, 2000, 6000, False) * 0.6
    if type_ == 'scribble':
        n = int(0.9 * SR); t = np.arange(n) / SR
        return bp(rng.standard_normal(n), 2500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t)) ** 2 * np.sin(np.pi * t / 0.9) * 0.5
    if type_ == 'stamp':
        return tone(130, 50, 0.35, 0.1) * 1.0 + lp(rng.standard_normal(int(0.35 * SR)), 1200) * env(int(0.35 * SR), 0.0005, 0.02) * 0.6
    raise ValueError(type_)

sfx = np.zeros((N + SR * 2, 2))
for i, e in enumerate(events):
    x = make(e['type']); x = x / (np.abs(x).max() + 1e-9)
    pan = 0.5 + 0.18 * np.sin(i * 1.7)
    add(sfx[:, 0], x * (1 - pan) * 2, e['t'], 0.16 * e['gain'])
    add(sfx[:, 1], x * pan * 2, e['t'], 0.16 * e['gain'])
sfx = sfx[:N]

# ------------------------------------------------------------------ voice + ducking
vo = read_wav(vo_path); vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo = vo / (np.sqrt(np.mean(vo[np.abs(vo) > 0.01] ** 2)) + 1e-9) * 0.16   # speech RMS ~ -16 dBFS
# envelope follower for sidechain
a = np.abs(vo); win = int(0.03 * SR)
envv = np.convolve(a, np.ones(win) / win, 'same')
att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
sc = np.zeros(N); g = 0.0
for i in range(0, N, 64):  # block-wise smoothing
    v = envv[i]; c = att if v > g else rel; g = c ** 64 * g + (1 - c ** 64) * v; sc[i:i + 64] = g
duck = 1 - 0.55 * np.clip(sc / 0.04, 0, 1)            # up to ~ -7 dB under speech
mix = music * duck[:, None] * 0.85 + sfx * (0.6 + 0.4 * duck[:, None]) + vo[:, None]
peak = np.abs(mix).max(); mix = mix / peak * 0.89 if peak > 0.89 else mix
with wave.open(out_path, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
# also stems for checking
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
print('music dB', round(rms_db(music * duck[:, None] * 0.85), 1), 'sfx dB', round(rms_db(sfx), 1), 'voice dB', round(rms_db(vo), 1))
