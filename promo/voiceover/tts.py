import asyncio, ssl, sys, json
import edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
async def main(voice, rate, pitch, text, out):
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words=[]
    with open(out,"wb") as f:
        async for ch in comm.stream():
            if ch["type"]=="audio": f.write(ch["data"])
            elif ch["type"]=="WordBoundary": words.append([ch["offset"]/1e7, ch["duration"]/1e7, ch["text"]])
    json.dump(words, open(out+".json","w"))
asyncio.run(main(*sys.argv[1:6]))
