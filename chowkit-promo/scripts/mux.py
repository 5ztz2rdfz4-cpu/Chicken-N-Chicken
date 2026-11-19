import subprocess, sys
L = sys.argv[1]
name = {"bm": "ChickenNChicken_ChowKit_BM_9x16.mp4", "en": "ChickenNChicken_ChowKit_EN_9x16.mp4"}[L]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"build/video_{L}.mp4", "-i", f"build/mix_{L}.wav",
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                "-movflags", "+faststart", "-shortest", f"output/{name}"], check=True)
print("wrote output/" + name)
