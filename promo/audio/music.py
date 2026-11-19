import numpy as np, sys, wave
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; DUR = 40.0; N = int(SR * DUR)
rng = np.random.default_rng(3)
out_dir = sys.argv[1]

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def add(buf, x, t):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * f * (1 + det)) % 1) - 1
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

BPM = 115; beat = 60 / BPM; bar = 4 * beat
music = np.zeros(N); drums = np.zeros(N)
# progression: C G Am F  (I V vi IV)
chords = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]]
roots = [36, 43, 45, 41]
nbars = int(DUR / bar) + 1
END_T = 38.6  # music final hit region

# reverb IR
irn = int(1.6 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR / 0.45); ir = lp(ir, 6000); ir /= np.sqrt(np.sum(ir ** 2))

pluck_bus = np.zeros(N); pad_bus = np.zeros(N); bass_bus = np.zeros(N); bell_bus = np.zeros(N)
for b in range(nbars):
    t0 = b * bar
    if t0 > END_T: break
    ch = chords[b % 4]; rt = roots[b % 4]
    # pad
    n = int(bar * SR)
    pad = sum(saw(mtof(m), n, d) for m in ch for d in (-0.004, 0.004)) / 6
    pad = lp(pad, 1400) * (np.minimum(1, np.arange(n) / SR / 0.3) * np.minimum(1, (n - np.arange(n)) / SR / 0.2))
    add(pad_bus, pad, t0)
    # pluck arpeggio 8ths
    pattern = [0, 1, 2, 1, 0, 2, 1, 2]
    for k in range(8):
        m = ch[pattern[k]] + 12
        nn = int(0.4 * SR)
        x = (saw(mtof(m), nn) + 0.5 * saw(mtof(m), nn, 0.006))
        x = lp(x, 3200) * env(nn, 0.003, 0.11)
        add(pluck_bus, x * (0.9 if k % 2 == 0 else 0.7), t0 + k * beat / 2)
    # bass 8ths, offbeat accents
    for k in range(8):
        nn = int(beat / 2 * SR * 0.9)
        tt = np.arange(nn) / SR
        f = mtof(rt)
        x = 0.7 * np.sin(2 * np.pi * f * tt) + 0.3 * lp(saw(f, nn), 500)
        x *= np.minimum(1, tt / 0.005) * np.exp(-tt / 0.25) * (1.0 if k % 2 else 0.75)
        add(bass_bus, x, t0 + k * beat / 2)

# drums
def kick():
    nn = int(0.35 * SR); tt = np.arange(nn) / SR
    f = 50 + 110 * np.exp(-tt / 0.03); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt / 0.12) + 0.3 * lp(rng.standard_normal(nn), 3000) * np.exp(-tt / 0.005)
def clap():
    nn = int(0.25 * SR); tt = np.arange(nn) / SR
    x = bp(rng.standard_normal(nn), 900, 3500)
    e = np.exp(-tt / 0.06) + 0.6 * np.exp(-((tt - 0.012) % 0.011) / 0.004) * (tt < 0.035)
    return x * e * 0.8
def hat(d=0.03):
    nn = int(0.12 * SR); tt = np.arange(nn) / SR
    return hp(rng.standard_normal(nn), 7000) * np.exp(-tt / d) * 0.35
K, C = kick(), clap()
nbeats = int(DUR / beat)
for i in range(nbeats):
    t = i * beat
    if t > END_T - 0.05: break
    intro = t < 1.0  # light intro: hats only first bar-ish
    if not intro: add(drums, K * 0.9, t)
    if i % 2 == 1 and t > 2.0: add(drums, C * 0.55, t)
    add(drums, hat(0.025) * (0.5 if intro else 1), t + beat / 2)
    if t > 5.0:
        add(drums, hat(0.012) * 0.45, t + beat / 4); add(drums, hat(0.012) * 0.45, t + 3 * beat / 4)

# bell motif (intro and ending)
def bell(m, d=1.2):
    nn = int(d * SR); tt = np.arange(nn) / SR; f = mtof(m)
    return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.15) + 0.2 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt / 0.05)) * np.exp(-tt / 0.5) * np.minimum(1, tt / 0.002)
motif = [(0, 79), (0.5, 76), (1, 79), (1.5, 84), (2.5, 83), (3, 79)]
for off, m in motif: add(bell_bus, bell(m) * 0.5, 0.15 + off * beat)
for off, m in [(0, 84), (0.5, 88), (1, 91), (2, 96)]: add(bell_bus, bell(m, 2.5) * 0.45, 34.4 + off * beat / 1.0)

# final chord hit
nn = int(3.0 * SR); tt = np.arange(nn) / SR
fin = sum(saw(mtof(m), nn, d) for m in [48, 60, 64, 67, 72] for d in (-0.003, 0.003)) / 10
fin = lp(fin, 2500) * np.exp(-tt / 1.0) * np.minimum(1, tt / 0.01)
add(pad_bus, fin * 1.4, END_T)
add(drums, K * 1.0, END_T); add(drums, C * 0.4, END_T)

music = 0.30 * pad_bus + 0.22 * pluck_bus + 0.55 * bass_bus + 0.30 * bell_bus
music = hp(music, 35)
wet = fftconvolve(music + 0.3 * drums, ir)[:N] * 0.18
mix = music + drums * 0.55 + wet
# intro filter sweep for first 1.0s handled via fade
fade = np.ones(N); fi = int(0.25 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo0 = int(39.2 * SR); fade[fo0:] = np.linspace(1, 0, N - fo0)
mix *= fade

# ---------- SFX ----------
sfx = np.zeros(N)
def whoosh(d=0.6, up=True):
    nn = int(d * SR); tt = np.arange(nn) / SR; x = rng.standard_normal(nn)
    out = np.zeros(nn); seg = 512
    for s in range(0, nn, seg):
        p = s / nn; fc = 300 + (5000 if up else 3000) * (p if up else 1 - p) ** 1.5
        out[s:s + seg] = bp(x[max(0, s - 2048):s + seg], max(80, fc * 0.5), min(20000, fc * 1.5))[-len(out[s:s + seg]):]
    e = np.sin(np.pi * tt / d) ** 2
    return out * e * 0.9
def pop(f=900):
    nn = int(0.12 * SR); tt = np.arange(nn) / SR
    ff = f * (1 + 1.5 * np.exp(-tt / 0.01)); ph = 2 * np.pi * np.cumsum(ff) / SR
    return np.sin(ph) * np.exp(-tt / 0.03) * 0.5
def ding():
    return bell(91, 1.5) * 0.35 + bell(96, 1.5) * 0.2
def riser(d):
    nn = int(d * SR); tt = np.arange(nn) / SR
    f = 200 * 2 ** (tt / d * 3); ph = 2 * np.pi * np.cumsum(f) / SR
    n2 = hp(rng.standard_normal(nn), 2000) * (tt / d) ** 2 * 0.3
    return (0.25 * np.sin(ph) * (tt / d) ** 2 + n2)
def impact():
    nn = int(1.5 * SR); tt = np.arange(nn) / SR
    f = 40 + 80 * np.exp(-tt / 0.05); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt / 0.4) * 0.9 + lp(rng.standard_normal(nn), 1500) * np.exp(-tt / 0.15) * 0.3

for t in [4.58, 19.43, 29.28]: add(sfx, whoosh(0.75), t - 0.05)
add(sfx, whoosh(0.7), 12.4)
for t in [23.1, 26.25]: add(sfx, whoosh(0.5, False) * 0.6, t)
pops = [(0.15, 700), (0.35, 800), (1.0, 900), (1.7, 1100), (1.92, 1200), (1.95, 900), (2.12, 1000), (3.45, 1000),
        (5.15, 800), (5.3, 900), (7.35, 700), (8.2, 1000), (13.95, 900), (14.8, 1050), (15.45, 1200), (17.1, 900), (17.25, 1000), (17.4, 1100), (17.55, 1200),
        (20.15, 800), (20.45, 1000), (23.45, 800), (23.75, 1000), (24.05, 1100), (26.6, 800), (26.9, 1000),
        (29.85, 800), (30.05, 900), (32.1, 1000), (35.3, 1000), (36.3, 900), (37.2, 1100)]
for t, f in pops: add(sfx, pop(f), t)
add(sfx, ding(), 5.6)
add(sfx, riser(0.9), 32.95)
add(sfx, impact(), 33.88)
add(sfx, ding() * 1.2, 34.45)

def save(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(f"{out_dir}/{name}", 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
mix /= np.max(np.abs(mix)) + 1e-9; sfx /= np.max(np.abs(sfx)) + 1e-9
save('music.wav', mix * 0.9); save('sfx.wav', sfx * 0.9)
print('ok')
