/* Master animation timeline. Every beat is keyed to the narration word timings in CUES. */
(function () {
  // ---------- inject artwork ----------
  document.querySelectorAll('[data-ph]').forEach(el => { el.innerHTML = PH[el.dataset.ph]; });
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon]; });
  document.getElementById('fam1').innerHTML = familySVG('famA');
  document.getElementById('famTable').innerHTML = familySVG('famB', { table: true });
  document.getElementById('fam2').innerHTML = familySVG('famC');
  buildMap();
  buildAmbient();

  const L = CUES.lines;
  const W = (li, word, n = 1) => {
    let k = 0;
    for (const w of L[li].words) if (w[2].toLowerCase().replace(/[^a-z-]/g, '') === word.toLowerCase() && ++k === n) return w[0];
    throw new Error('cue not found ' + li + ' ' + word);
  };
  const T = {
    end: CUES.total,
    s1b: L[1].start - 0.2,
    s2: L[2].start + 0.05,
    s3: L[3].start - 0.2,
    s3h: L[4].start - 0.05,
    s4: W(4, 'surau') - 0.3,
    s4b: L[5].start - 0.15,
    s5a: L[6].start - 0.15,
    s5b: W(6, 'bolehlah') - 0.15,
    s5c: L[7].start - 0.2,
  };
  window.T = T;
  const SFX = []; window.SFX = SFX;
  const sfx = (t, type, gain = 1) => SFX.push({ t: +t.toFixed(3), type, gain });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.6 } });
  window.TL = tl;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const show = (sel, t) => tl.set(sel, { visibility: 'visible' }, t);
  const hide = (sel, t) => tl.set(sel, { visibility: 'hidden' }, t);
  const popIn = (el, t, o = {}) => tl.fromTo(el, { autoAlpha: 0, scale: o.s ?? 0.4, y: o.y ?? 40, rotation: o.r ?? 0 },
    { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: o.d ?? 0.55, ease: o.ease ?? 'back.out(2)' }, t);
  const floatLoop = (el, t, amp = 14, dur = 1.6, rot = 0) => tl.to(el, { y: `-=${amp}`, rotation: `+=${rot}`, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: 40 }, t);
  const familyIdle = (id, t) => {
    const r = $('#' + id);
    ['.p-dad', '.p-mum', '.p-boy', '.p-girl'].forEach((p, i) => {
      tl.to(r.querySelector(p), { y: -8 - (i > 1 ? 6 : 0), duration: 0.42 + i * 0.03, ease: 'sine.inOut', yoyo: true, repeat: 60 }, t + i * 0.12);
    });
    tl.fromTo(r.querySelector('.wave'), { rotation: -6, svgOrigin: '528 276' }, { rotation: 16, svgOrigin: '528 276', duration: 0.32, ease: 'sine.inOut', yoyo: true, repeat: 80 }, t);
    r.querySelectorAll('.head').forEach((h, i) => tl.fromTo(h, { rotation: -3, transformOrigin: '50% 90%' }, { rotation: 3, duration: 0.7 + i * 0.07, ease: 'sine.inOut', yoyo: true, repeat: 40 }, t + i * 0.2));
  };

  // ambient particles drift for the full film
  $$('.amb').forEach((p, i) => {
    tl.to(p, { y: `-=${60 + (i % 5) * 25}`, x: `+=${(i % 2 ? 1 : -1) * (20 + i * 3)}`, duration: 3 + (i % 4), ease: 'sine.inOut', yoyo: true, repeat: 12 }, 0);
  });

  // =====================================================================
  // SCENE 1 — HOOK (0 → s1b)
  // =====================================================================
  show('#s1', 0);
  tl.fromTo('#burst', { scale: 0, autoAlpha: 1 }, { scale: 260, autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, 0);
  sfx(0.0, 'whoosh_up', 0.9);
  tl.fromTo('#cal', { rotationX: -100, autoAlpha: 0, y: -40 }, { rotationX: 0, autoAlpha: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' }, 0.08);
  sfx(0.12, 'swish', 0.7);
  tl.from('#cal .day', { y: 40, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: 'back.out(2)' }, 0.35);
  tl.to('#dSab .fill', { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, 0.95); sfx(0.95, 'pop', 0.8);
  tl.to('#dAhd .fill', { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, 1.15); sfx(1.15, 'pop', 0.8);
  tl.to(['#dSab .blk', '#dAhd .blk'], { y: -10, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 5, stagger: 0.15 }, 1.5);
  const h1w = $$('#h1 .word');
  const h1t = [W(0, 'weekend'), W(0, 'ni'), W(0, 'tak'), W(0, 'tahu'), W(0, 'nak'), W(0, 'bawa'), W(0, 'family'), W(0, 'pergi'), W(0, 'mana')];
  h1w.forEach((w, i) => popIn(w, h1t[i] - 0.06, { y: 70, s: 0.5, d: 0.45 }));
  tl.fromTo('#h1 .hl', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.4 }, W(0, 'family') + 0.15);
  tl.set('#h1 .hl', { backgroundRepeat: 'no-repeat' }, 0);
  tl.to(h1w[8], { rotation: 6, duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' }, W(0, 'mana') + 0.4);
  // family
  popIn('#fam1', 0.35, { y: 220, s: 0.7, d: 0.8, ease: 'back.out(1.3)' }); sfx(0.4, 'swish', 0.5);
  familyIdle('famA', 0.9);
  popIn('#q1', 2.9, { r: -30 }); popIn('#q2', 3.1, { r: 30 }); sfx(2.95, 'pop', 0.6);
  floatLoop('#q1', 3.4, 12, 0.6, 8); floatLoop('#q2', 3.5, 10, 0.55, -8);

  // ---- 1b : search + checklist ----
  const t1b = T.s1b;
  tl.to('#calWrap', { y: -620, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, t1b - 0.1);
  tl.to('#h1', { y: -500, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, t1b - 0.05);
  tl.to(['#q1', '#q2'], { autoAlpha: 0, scale: 0, duration: 0.3 }, t1b);
  tl.to('#fam1Wrap', { y: 110, duration: 0.7, ease: 'power3.inOut' }, t1b);
  sfx(t1b - 0.1, 'whoosh', 0.8);
  popIn('#search', t1b + 0.25, { y: -60, s: 0.8 });
  const typed = 'Tempat makan family best?';
  const typer = { n: 0 };
  tl.to(typer, { n: typed.length, duration: 0.9, ease: 'none', onUpdate: () => { $('#typed').textContent = typed.slice(0, Math.round(typer.n)); } }, t1b + 0.45);
  tl.set('#typed', { textContent: '' }, 0);
  sfx(t1b + 0.45, 'type', 0.5);
  tl.to('#search .caret', { opacity: 0, duration: 0.01, repeat: 14, yoyo: true, repeatDelay: 0.25 }, t1b + 1.4);
  const ckT = [W(1, 'selesa'), W(1, 'anak-anak'), W(1, 'keluarga')];
  ['#ck1', '#ck2', '#ck3'].forEach((c, i) => {
    tl.fromTo(c, { x: 1000, rotation: 6, autoAlpha: 0 }, { x: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.3)' }, ckT[i] - 0.25);
    tl.from(c + ' .badge', { scale: 0, rotation: -90, duration: 0.5, ease: 'back.out(2.5)' }, ckT[i] - 0.05);
    sfx(ckT[i] - 0.25, 'swish', 0.6);
  });
  // ticks — the answer is coming
  const tickT = T.s2 - 0.42;
  ['#ck1', '#ck2', '#ck3'].forEach((c, i) => {
    tl.to(c + ' .on', { scale: 1, duration: 0.3, ease: 'back.out(3)' }, tickT + i * 0.13);
    tl.to(c + ' .ckpath', { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' }, tickT + i * 0.13 + 0.05);
    tl.to(c, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1 }, tickT + i * 0.13);
    sfx(tickT + i * 0.13, 'ding', 0.55 + i * 0.1);
  });

  // =====================================================================
  // SCENE 2 — BRAND INTRO
  // =====================================================================
  const t2 = T.s2;
  show('#s2', t2);
  tl.fromTo('#s2', { clipPath: 'circle(0px at 540px 820px)' }, { clipPath: 'circle(2000px at 540px 820px)', duration: 0.7, ease: 'power3.in' }, t2);
  hide('#s1', t2 + 0.75);
  sfx(t2, 'whoosh_up', 1);
  tl.fromTo('#rays2', { rotation: 0, scale: 0.6 }, { rotation: 40, scale: 1, duration: T.s3 - t2 + 0.5, ease: 'none' }, t2);
  const jw = $$('#jom .word');
  popIn(jw[0], W(2, 'singgah') - 0.45, { y: 90, s: 0.3 });
  popIn(jw[1], W(2, 'singgah') - 0.05, { y: 90, s: 0.3 });
  tl.to('#swoosh path', { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, W(2, 'singgah') + 0.3);
  const tLogo = W(2, 'chicken') - 0.12;
  tl.fromTo('#logoCard', { scale: 0.2, autoAlpha: 0, rotation: -8 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' }, tLogo);
  tl.fromTo('#logoCard img', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.inOut' }, tLogo + 0.15);
  sfx(tLogo, 'impact', 0.9); sfx(tLogo + 0.2, 'shimmer', 0.6);
  tl.fromTo('#sub', { autoAlpha: 0, y: 30, letterSpacing: '12px' }, { autoAlpha: 1, y: 0, letterSpacing: '1.5px', duration: 0.8 }, tLogo + 0.5);
  tl.fromTo('#store', { y: 900, rotation: 8 }, { y: 0, rotation: -2, duration: 0.9, ease: 'power4.out' }, t2 + 0.55);
  tl.fromTo('#store img', { scale: 1.12 }, { scale: 1, duration: 4, ease: 'none', transformOrigin: '60% 40%' }, t2 + 0.55);
  sfx(t2 + 0.55, 'swish', 0.6);
  const tPin = W(2, 'kota') - 0.15;
  tl.fromTo('#pin1', { y: -700, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'bounce.out' }, tPin);
  sfx(tPin + 0.32, 'thud', 0.8);
  ['#rp1', '#rp2'].forEach((r, i) => tl.fromTo(r, { scale: 0.2, autoAlpha: 1 }, { scale: 2.6, autoAlpha: 0, duration: 1.1, ease: 'power2.out', repeat: 1 }, tPin + 0.45 + i * 0.35));
  tl.fromTo('#loc1 .chip', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, tPin + 0.45);
  sfx(tPin + 0.45, 'pop', 0.7);

  // ---- zoom through the front door into the restaurant ----
  const t3 = T.s3;
  tl.to(['#jom', '#swoosh', '#logoCard', '#sub', '#pin1', '#loc1'], { autoAlpha: 0, y: -60, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, t3 - 0.1);
  tl.to('#store', { scale: 7, rotation: 0, transformOrigin: '550px 505px', duration: 0.7, ease: 'power3.in' }, t3);
  tl.to('#store', { borderWidth: 0, duration: 0.3 }, t3);
  tl.fromTo('#flash', { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power1.in' }, t3 + 0.55);
  tl.to('#flash', { opacity: 0, duration: 0.45, ease: 'power2.out' }, t3 + 0.73);
  sfx(t3, 'whoosh_up', 0.9);

  // =====================================================================
  // SCENE 3 — COMFORTABLE FAMILY DINING
  // =====================================================================
  show('#s3', t3 + 0.72); hide('#s2', t3 + 0.75);
  const bw = $$('#bubble .word');
  tl.fromTo('#bubble', { scale: 0, rotation: -12, autoAlpha: 0 }, { scale: 1, rotation: -3, autoAlpha: 1, duration: 0.55, ease: 'back.out(2)', transformOrigin: '20% 100%' }, t3 + 0.72);
  sfx(t3 + 0.75, 'pop', 0.9);
  const bT = [W(3, 'bukan'), W(3, 'setakat'), W(3, 'tempat'), W(3, 'makan'), W(3, 'tau')];
  bw.forEach((w, i) => popIn(w, Math.max(bT[i] - 0.08, t3 + 0.8), { y: 40, s: 0.6, d: 0.35 }));
  tl.to('#bubble', { rotation: 3, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, W(3, 'tau'));
  tl.to('#bubble', { scale: 0, autoAlpha: 0, rotation: 10, duration: 0.35, ease: 'back.in(2)' }, T.s3h - 0.05);
  sfx(T.s3h - 0.05, 'swish', 0.5);
  const t3h = T.s3h;
  const h3w = $$('#h3 .word');
  h3w.forEach((w, i) => popIn(w, t3h + 0.15 + i * 0.09, { y: 60, s: 0.6, d: 0.45 }));
  tl.fromTo('#p3card', { clipPath: 'inset(50% 50% 50% 50% round 44px)', scale: 0.9 }, { clipPath: 'inset(0% 0% 0% 0% round 44px)', scale: 1, duration: 0.8, ease: 'power3.inOut' }, t3h + 0.15);
  tl.fromTo('#p3card img', { scale: 1.2, x: 30 }, { scale: 1.02, x: -20, duration: 3.6, ease: 'power1.out' }, t3h + 0.15);
  sfx(t3h + 0.15, 'whoosh', 0.6);
  const tRuang = W(4, 'ruang');
  tl.fromTo('#p2card', { x: 700, rotation: 14 }, { x: 0, rotation: 4, duration: 0.75, ease: 'back.out(1.2)' }, tRuang - 0.35);
  tl.fromTo('#p2card img', { scale: 1.15 }, { scale: 1, duration: 3, ease: 'none' }, tRuang - 0.35);
  popIn('#tagRuang', tRuang + 0.1, { s: 0.3, r: -10 }); sfx(tRuang + 0.1, 'pop', 0.7);
  popIn('#famTable', tRuang - 0.1, { y: 300, s: 0.8, d: 0.7, ease: 'back.out(1.4)' });
  familyIdle('famB', tRuang + 0.4);
  ['#f1', '#f2', '#f3', '#f4'].forEach((f, i) => {
    popIn(f, t3h + 0.6 + i * 0.18, { r: -60, s: 0 });
    floatLoop(f, t3h + 1.2 + i * 0.18, 16, 0.9 + i * 0.1, i % 2 ? 8 : -8);
  });
  sfx(t3h + 0.6, 'pop', 0.4); sfx(t3h + 0.96, 'pop', 0.4);

  // whip pan to facilities
  const t4 = T.s4;
  tl.to('#s3', { x: -1080, skewX: 6, duration: 0.45, ease: 'power3.in' }, t4 - 0.1);
  show('#s4', t4);
  tl.fromTo('#s4', { x: 1080, skewX: 6 }, { x: 0, skewX: 0, duration: 0.55, ease: 'power3.out' }, t4 + 0.25);
  hide('#s3', t4 + 0.4);
  sfx(t4 - 0.1, 'whoosh', 1);

  // =====================================================================
  // SCENE 4 — FAMILY FACILITIES
  // =====================================================================
  popIn('#h4 .pill', t4 + 0.4, { y: -40, s: 0.6 });
  const fcIn = (id, t, fromX) => {
    tl.fromTo(id, { x: fromX, autoAlpha: 0, rotation: fromX > 0 ? 6 : -6 }, { x: 0, autoAlpha: 1, rotation: 0, duration: 0.65, ease: 'back.out(1.2)' }, t);
    tl.fromTo(id + ' .photo', { clipPath: 'inset(0 0 100% 0 round 34px)' }, { clipPath: 'inset(0 0 0% 0 round 34px)', duration: 0.6, ease: 'power3.inOut' }, t + 0.2);
    tl.fromTo(id + ' .photo img', { scale: 1.25 }, { scale: 1.04, duration: 4, ease: 'power1.out' }, t + 0.2);
    tl.fromTo(id + ' .badge', { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.2)' }, t + 0.35);
    tl.fromTo(id + ' .num', { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.45 }, t + 0.3);
    tl.fromTo(id + ' .ttl .ln span', { yPercent: 110 }, { yPercent: 0, duration: 0.55, stagger: 0.1, ease: 'power4.out' }, t + 0.4);
    tl.fromTo(id + ' .bar', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, t + 0.6);
    tl.fromTo(id + ' .desc', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 }, t + 0.7);
    sfx(t, 'swish', 0.8); sfx(t + 0.38, 'pop', 0.6);
  };
  fcIn('#fc1', t4 + 0.35, 900);
  tl.to('#fc1 .badge', { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 }, W(4, 'solat'));
  const tTaman = W(4, 'taman') - 0.25;
  fcIn('#fc2', tTaman, -900);
  tl.to('#pg2', { backgroundColor: '#F08A24', duration: 0.2 }, tTaman);
  tl.to('#pg1', { backgroundColor: '#E7D3BE', duration: 0.2 }, tTaman);
  tl.fromTo('#fc2 .badge', { rotation: -10 }, { rotation: 10, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, tTaman + 1.0);
  tl.fromTo('#prog', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t4 + 0.6);

  // =====================================================================
  // SCENE 4b — PARENTS EAT, KIDS PLAY (camera pans the real dining hall)
  // =====================================================================
  const t5 = T.s4b;
  show('#s5', t5);
  tl.fromTo('#s5', { clipPath: 'polygon(0% 100%, 100% 115%, 100% 115%, 0% 100%)' },
    { clipPath: 'polygon(0% -15%, 100% 0%, 100% 115%, 0% 100%)', duration: 0.6, ease: 'power3.inOut' }, t5);
  hide('#s4', t5 + 0.65);
  sfx(t5, 'whoosh_up', 0.8);
  const h5w = $$('#h5 .word');
  const h5t = [W(5, 'mak'), W(5, 'ayah'), W(5, 'makanan'), W(5, 'anak-anak'), W(5, 'bermain')];
  h5w.forEach((w, i) => popIn(w, h5t[i] - 0.1, { y: 60, s: 0.5, d: 0.45 }));
  tl.fromTo('#pan', { scale: 0.85, autoAlpha: 0, y: 120 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, t5 + 0.3);
  tl.fromTo('#panInner', { x: 0, scale: 1.08, transformOrigin: '30% 70%' }, { x: 0, scale: 1, duration: 1.8, ease: 'power1.out' }, t5 + 0.3);
  const tA = W(5, 'menikmati') - 0.2;
  popIn('#mkA', tA - 0.2, { s: 0, y: 0, ease: 'back.out(3)' });
  tl.fromTo('#mrA', { scale: 1, autoAlpha: 0.9 }, { scale: 3.2, autoAlpha: 0, duration: 1, repeat: 3, ease: 'power2.out' }, tA);
  tl.fromTo('#coA', { x: -700, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.3)' }, tA);
  sfx(tA - 0.2, 'pop', 0.7); sfx(tA, 'swish', 0.6);
  const tB = W(5, 'anak-anak') - 0.35;
  tl.to('#panInner', { x: -435, duration: 1.1, ease: 'power2.inOut' }, tB - 0.2);
  sfx(tB - 0.2, 'whoosh', 0.55);
  popIn('#mkB', tB + 0.6, { s: 0, y: 0, ease: 'back.out(3)' });
  tl.fromTo('#mrB', { scale: 1, autoAlpha: 0.9 }, { scale: 3.2, autoAlpha: 0, duration: 1, repeat: 2, ease: 'power2.out' }, tB + 0.8);
  tl.fromTo('#coB', { x: 700, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.3)' }, tB + 0.7);
  sfx(tB + 0.6, 'pop', 0.7); sfx(tB + 0.7, 'swish', 0.6);
  tl.to('#coB .badge', { rotation: 12, duration: 0.22, yoyo: true, repeat: 5, ease: 'sine.inOut' }, tB + 1.3);

  // =====================================================================
  // SCENE 5a — AROUND SEPANG (map)
  // =====================================================================
  const t6 = T.s5a;
  show('#s6', t6);
  tl.fromTo('#s6', { clipPath: 'circle(0px at 540px 980px)' }, { clipPath: 'circle(1700px at 540px 980px)', duration: 0.6, ease: 'power3.in' }, t6);
  hide('#s5', t6 + 0.65);
  sfx(t6, 'whoosh_up', 0.8);
  tl.fromTo('#mapWrap', { scale: 1.6, rotation: -6 }, { scale: 1, rotation: 0, duration: 1.9, ease: 'power3.out' }, t6);
  const h6w = $$('#h6 .word');
  popIn(h6w[0], W(6, 'sekitar') - 0.1, { y: 60, s: 0.5 }); popIn(h6w[1], W(6, 'sepang') - 0.1, { y: 60, s: 0.5 });
  tl.fromTo('#pin2', { y: -800, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, ease: 'bounce.out' }, t6 + 0.35);
  sfx(t6 + 0.68, 'thud', 0.8);
  tl.fromTo('#radius', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.5)' }, W(6, 'sekitar') - 0.05);
  tl.to('#radius', { rotation: 60, duration: 3, ease: 'none' }, W(6, 'sekitar'));
  tl.fromTo('#lbl2 .chip', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, W(6, 'sepang') - 0.05);
  sfx(W(6, 'sepang') - 0.05, 'pop', 0.7);

  // =====================================================================
  // SCENE 5b — ADD TO YOUR WEEKEND LIST
  // =====================================================================
  const t7 = T.s5b;
  tl.to('#mapWrap', { scale: 3.5, duration: 0.6, ease: 'power3.in' }, t7 - 0.1);
  tl.to(['#h6', '#lbl2', '#radius'], { autoAlpha: 0, duration: 0.3 }, t7 - 0.1);
  show('#s7', t7);
  tl.fromTo('#s7', { clipPath: 'circle(0px at 540px 910px)' }, { clipPath: 'circle(1800px at 540px 910px)', duration: 0.6, ease: 'power3.in' }, t7);
  hide('#s6', t7 + 0.65);
  sfx(t7, 'whoosh_up', 0.9);
  tl.fromTo('#rays7', { rotation: 0 }, { rotation: 70, duration: T.end - t7, ease: 'none' }, t7);
  const mw = $$('#main .word');
  mw.forEach((w, i) => popIn(w, t7 + 0.35 + i * 0.12, { y: 70, s: 0.5, d: 0.5 }));
  sfx(t7 + 0.35, 'swish', 0.5);
  tl.fromTo('#note', { rotationX: 70, y: 500, autoAlpha: 0, rotation: -3 }, { rotationX: 0, y: 0, autoAlpha: 1, rotation: -3, duration: 0.8, ease: 'back.out(1.2)' }, t7 + 0.5);
  sfx(t7 + 0.5, 'paper', 0.7);
  const tHand = W(6, 'chicken') - 0.15;
  tl.fromTo('#hand1', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 0.9, ease: 'power1.inOut' }, tHand);
  sfx(tHand, 'scribble', 0.6);
  tl.to('#note .ckpath', { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, tHand + 0.95);
  tl.set('#note .ckpath', { strokeDasharray: 1, strokeDashoffset: 1 }, 0);
  sfx(tHand + 0.95, 'ding', 0.8);
  tl.fromTo('#hand2', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 0.8, ease: 'power1.inOut' }, W(6, 'port') - 0.2);
  sfx(W(6, 'port') - 0.2, 'scribble', 0.45);
  const tStamp = W(6, 'hujung') - 0.1;
  tl.fromTo('#stamp', { scale: 2.6, autoAlpha: 0, rotation: -20 }, { scale: 1, autoAlpha: 1, rotation: 12, duration: 0.35, ease: 'power4.in' }, tStamp);
  tl.to('#note', { x: 8, y: 6, duration: 0.06, yoyo: true, repeat: 3 }, tStamp + 0.35);
  sfx(tStamp + 0.33, 'stamp', 0.9);

  // =====================================================================
  // SCENE 5c — LOGO REVEAL END CARD
  // =====================================================================
  const t8 = T.s5c;
  tl.to('#note', { rotationY: 90, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, t8);
  sfx(t8, 'whoosh', 0.7);
  tl.to('#main', { y: -10, scale: 0.94, duration: 0.6, ease: 'power2.inOut' }, t8);
  const tL = t8 + 0.35;
  tl.fromTo('#logoEnd', { scale: 0, rotation: -10, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.8, ease: 'elastic.out(1, 0.6)' }, tL);
  tl.fromTo('#logoEnd img', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power2.inOut' }, tL + 0.2);
  sfx(tL, 'impact', 1); sfx(tL + 0.2, 'shimmer', 0.8);
  tl.fromTo('#shine', { left: -220 }, { left: 1100, duration: 0.8, ease: 'power2.inOut' }, tL + 1.0);
  tl.fromTo('#shine', { left: -220 }, { left: 1100, duration: 0.8, ease: 'power2.inOut', immediateRender: false }, tL + 2.6);
  ['#sp1', '#sp2', '#sp3', '#sp4'].forEach((s, i) => {
    tl.fromTo(s, { scale: 0, rotation: -90, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(3)' }, tL + 0.4 + i * 0.08);
    tl.to(s, { scale: 0.6, rotation: 45, duration: 0.6, yoyo: true, repeat: 6, ease: 'sine.inOut' }, tL + 0.9 + i * 0.1);
  });
  tl.fromTo('#locEnd .k', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, tL + 0.75);
  tl.fromTo('#locEnd .s', { autoAlpha: 0, y: 40, letterSpacing: '20px' }, { autoAlpha: 1, y: 0, letterSpacing: '2px', duration: 0.7 }, tL + 0.85);
  sfx(tL + 0.8, 'swish', 0.5);
  const tw = $$('#tagEnd .word');
  tw.forEach((w, i) => tl.fromTo(w, { autoAlpha: 0, x: i ? 60 : -60 }, { autoAlpha: 1, x: 0, duration: 0.55 }, tL + 1.35 + i * 0.3));
  popIn('#fam2', tL + 1.5, { y: 300, s: 0.7, d: 0.8, ease: 'back.out(1.4)' });
  sfx(tL + 1.5, 'pop', 0.6);
  familyIdle('famC', tL + 2.0);
  ['#ht1', '#ht2'].forEach((h, i) => {
    tl.fromTo(h, { scale: 0, autoAlpha: 0, y: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)' }, tL + 2.0 + i * 0.25);
    tl.to(h, { y: -160, autoAlpha: 0, rotation: i ? 20 : -20, duration: 1.6, ease: 'power1.in' }, tL + 2.4 + i * 0.25);
  });
  tl.to({}, { duration: 0.01 }, T.end);
})();

// ---------- builders ----------
function buildAmbient() {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cols = ['#F08A24', '#FFC845', '#2BA88F', '#FF7E8F', '#F08A24'];
  const scenes = Array.from(document.querySelectorAll('.scene'));
  for (let i = 0; i < 16 * scenes.length; i++) {
    const amb = scenes[Math.floor(i / 16)];
    const d = document.createElement('div'); d.className = 'amb';
    const s = 10 + rnd() * 26;
    Object.assign(d.style, { width: s + 'px', height: s + 'px', left: rnd() * 1040 + 'px', top: 120 + rnd() * 1700 + 'px', background: cols[i % 5], opacity: (0.18 + rnd() * 0.25).toFixed(2) });
    amb.insertBefore(d, amb.children[1] || null);
  }
}

function buildMap() {
  const svg = document.getElementById('mapSvg');
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let g = `<rect width="1080" height="1920" fill="#F4E6D4"/>`;
  for (let y = -40; y < 1960; y += 150) for (let x = -40; x < 1120; x += 170) {
    const park = rnd() < 0.16;
    g += `<rect x="${x + 14}" y="${y + 14}" width="${142}" height="${122}" rx="18" fill="${park ? '#CFE6C3' : '#EEDCC5'}"/>`;
    if (park) g += `<circle cx="${x + 60}" cy="${y + 60}" r="16" fill="#A9D69B"/><circle cx="${x + 100}" cy="${y + 86}" r="12" fill="#A9D69B"/>`;
  }
  g += `<path d="M-60,560 C300,620 560,700 1140,520" stroke="#BFD9EE" stroke-width="70" fill="none" opacity=".9"/>`;
  const roads = [
    'M-40,1180 C260,1120 420,1010 560,980 C760,940 900,1000 1120,900',
    'M300,-40 C340,400 470,760 540,980 C600,1180 640,1500 600,1960',
    'M-40,1620 C300,1560 700,1600 1120,1480',
    'M900,-40 C880,400 860,800 820,1960',
    'M-40,300 C300,340 700,260 1120,330',
  ];
  roads.forEach((d, i) => {
    g += `<path d="${d}" stroke="#E2CCB1" stroke-width="${i < 2 ? 56 : 40}" fill="none" stroke-linecap="round"/>`;
    g += `<path d="${d}" stroke="${i === 0 ? '#FFD27E' : '#FFFFFF'}" stroke-width="${i < 2 ? 42 : 28}" fill="none" stroke-linecap="round"/>`;
  });
  g += `<path d="${roads[0]}" stroke="#fff" stroke-width="4" stroke-dasharray="22 22" fill="none" opacity=".9"/>`;
  svg.innerHTML = g;
}
