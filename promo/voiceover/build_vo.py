import json, subprocess, sys, numpy as np
V = sys.argv[1]; d = sys.argv[2]; out = sys.argv[3]
SR = 48000
start = 0.5; gaps = [0.32, 0.3, 0.3, 0.25, 0.32, 0.32, 0.38]
track = np.zeros(int(SR*45), np.float32)
cues = {"lines": []}
t = start
for i in range(1, 9):
    w = json.load(open(f"{d}/{V}_{i}.mp3.json"))
    a = w[0][0] - 0.06; b = w[-1][0] + w[-1][1] + 0.18
    pcm = subprocess.run(["ffmpeg","-v","error","-i",f"{d}/{V}_{i}.mp3","-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout
    x = np.frombuffer(pcm, np.float32)[int(a*SR):int(b*SR)].copy()
    n = int(0.01*SR); x[:n] *= np.linspace(0,1,n); x[-n:] *= np.linspace(1,0,n)
    i0 = int(t*SR); track[i0:i0+len(x)] += x
    cues["lines"].append({"start": round(t,3), "end": round(t+len(x)/SR,3),
        "words": [[round(t+o-a,3), round(du,3), tx] for o,du,tx in w]})
    t += len(x)/SR + (gaps[i-1] if i < 8 else 0)
cues["voiceEnd"] = round(t,3)
cues["total"] = round(t + 2.4, 2)
track = track[:int(cues["total"]*SR)]
import wave
with wave.open(out+".wav","wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(track,-1,1)*32767).astype(np.int16).tobytes())
json.dump(cues, open(out+".json","w"), indent=1)
print(V, "voiceEnd", cues["voiceEnd"], "total", cues["total"])
for L in cues["lines"]: print(L["start"], L["end"], " ".join(f'{w[2]}@{w[0]}' for w in L["words"]))
