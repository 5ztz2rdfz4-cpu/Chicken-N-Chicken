// Deterministic frame-by-frame capture of src/index.html → H.264 (silent) + SFX cue sheet.
// usage: node render.js <lang> <outVideo|previewDir> [--preview t1,t2,...]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const [lang, out, flag, list] = process.argv.slice(2);
const FPS = 30;
(async () => {
  const tl = JSON.parse(fs.readFileSync(`${ROOT}/build/timeline_${lang}.json`, 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exit(1); });
  await page.addInitScript(t => { window.TL = t; }, tl);
  await page.goto('file://' + ROOT + '/src/index.html');
  await page.evaluate(() => window.READY);
  fs.writeFileSync(`${ROOT}/build/sfx_${lang}.json`, JSON.stringify(await page.evaluate(() => window.SFX_CUES), null, 1));
  if (flag === '--preview') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of list.split(',').map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: `${out}/${lang}_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 80 });
    }
    await browser.close(); return;
  }
  const n = Math.round(tl.total * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`${lang} frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await browser.close(); console.log('done', out);
})();
