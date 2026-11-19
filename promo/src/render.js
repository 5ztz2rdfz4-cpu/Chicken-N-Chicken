// Usage: node render.js <cues.json> preview <t1,t2,...> <outdir>
//        node render.js <cues.json> full <out.mp4> [fps]
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const [cuesPath, mode, arg, arg2] = process.argv.slice(2);
const dir = __dirname;
const names = ['calendar-heart','users-four','heart','magnifying-glass','fork-knife','baby','map-pin','armchair','hamburger','sparkle','mosque','storefront'];
const PH = {}; for (const n of names) PH[n] = fs.readFileSync(path.join(dir, `node_modules/@phosphor-icons/core/assets/fill/${n}-fill.svg`), 'utf8');
fs.writeFileSync(path.join(dir, 'ph.js'), 'window.PH=' + JSON.stringify(PH) + ';');
fs.writeFileSync(path.join(dir, 'cues.js'), 'window.CUES=' + fs.readFileSync(cuesPath, 'utf8') + ';');
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console', m.text()); });
  await page.goto('file://' + path.join(dir, 'index.html'));
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
  const meta = await page.evaluate(() => ({ T: window.T, SFX: window.SFX, dur: TL.duration() }));
  fs.writeFileSync(path.join(dir, 'sfx.json'), JSON.stringify(meta.SFX, null, 0));
  console.log('duration', meta.dur.toFixed(2), 'scenes', JSON.stringify(meta.T));
  const seek = t => page.evaluate(t => { TL.seek(t, false); }, t);
  if (mode === 'preview') {
    fs.mkdirSync(arg2, { recursive: true });
    for (const t of arg.split(',').map(Number)) { await seek(t); await page.screenshot({ path: path.join(arg2, `f_${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 85 }); }
  } else {
    const fps = +(arg2 || 30), total = Math.round(JSON.parse(fs.readFileSync(cuesPath)).total * fps);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(fps), arg], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < total; f++) {
      await seek(f / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${total} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('done', total, 'frames');
  }
  await browser.close();
})();
