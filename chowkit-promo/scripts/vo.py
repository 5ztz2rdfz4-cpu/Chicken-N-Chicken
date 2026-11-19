import certifi, asyncio, os, json, sys, subprocess
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts
OUT = sys.argv[1]
LINES = {
 "bm": ("ms-MY-YasminNeural", "+22%", [
  ("hook",  "Korang yang kerja sekitar Chow Kit, Kuala Lumpur, tengah fikir nak makan apa untuk lunch hari ni?"),
  ("intro", "Haa, sekarang Chicken N Chicken dah ada cawangan baharu di Chow Kit, Kuala Lumpur!"),
  ("main1", "Kalau korang tengah cari tempat untuk makan tengah hari, nak singgah makan bersama kawan pejabat, ataupun sekadar nak isi perut selepas penat bekerja, bolehlah datang singgah ke sini."),
  ("main2", "Tak perlu pergi jauh. Kalau kebetulan korang berada di sekitar kawasan Chow Kit, boleh masukkan Chicken N Chicken dalam senarai tempat makan korang!"),
  ("cta1",  "Jadi, kepada semua warga Kuala Lumpur, khususnya yang bekerja sekitar Chow Kit, jemput datang ke Chicken N Chicken!"),
  ("cta2",  "Chicken N Chicken, sekarang lebih dekat dengan korang!"),
 ]),
 "en": ("en-SG-LunaNeural", "+8%", [
  ("hook",  "Working around Chow Kit, Kuala Lumpur, and wondering what to have for lunch today?"),
  ("intro", "Well, Chicken N Chicken now has a brand-new branch in Chow Kit, Kuala Lumpur!"),
  ("main1", "If you're looking for a place to have lunch, a spot to grab a bite with your colleagues, or just somewhere to refuel after a long day at work, come and drop by."),
  ("main2", "No need to go far. If you happen to be around Chow Kit, add Chicken N Chicken to your list of places to eat!"),
  ("cta1",  "So, to everyone in Kuala Lumpur, especially those working around Chow Kit, come on down to Chicken N Chicken!"),
  ("cta2",  "Chicken N Chicken, now closer to you!"),
 ]),
}
async def gen(lang):
    voice, rate, lines = LINES[lang]
    meta = {}
    for key, text in lines:
        fn = f"{OUT}/{lang}_{key}.mp3"
        c = edge_tts.Communicate(text, voice, rate=rate, proxy=os.environ.get("HTTPS_PROXY"))
        words = []
        with open(fn, "wb") as f:
            async for ch in c.stream():
                if ch["type"] == "audio": f.write(ch["data"])
                elif ch["type"] in ("WordBoundary","SentenceBoundary"): words.append((ch["offset"]/1e7, ch["duration"]/1e7, ch["text"]))
        d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",fn]))
        meta[key] = {"text": text, "dur": d, "words": words}
        print(lang, key, round(d,2))
    json.dump(meta, open(f"{OUT}/{lang}_meta.json","w"), indent=1, ensure_ascii=False)
async def main():
    for l in sys.argv[2:]: await gen(l)
asyncio.run(main())
