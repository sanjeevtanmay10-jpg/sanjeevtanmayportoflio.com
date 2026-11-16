/* Sanju: the site's guide. A scripted character, no AI at runtime.
   Petals rotate, the face stays upright, movement runs on springs. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const root = $('#sanju'), body = $('#sjBody'), petals = $('#sjPetals'), sheen = $('.sj-sheen');
  const lookG = $('#sjLook'), eyeL = $('#eyeL'), eyeR = $('#eyeR'), mouth = $('#sjMouth'), mOpen = $('.m-open');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RATIO = 505 / 520;

  const S = {
    x: innerWidth / 2, y: innerHeight / 2, s: 120, vx: 0, vy: 0, vs: 0,
    angle: 0, spin: 14, spinBase: 14, sheen: 0,
    lookX: 0, lookY: 0, tLookX: 0, tLookY: 0, lookUntil: 0,
    anchor: null, anchorKind: '', placed: false, hopT: 0,
    px: innerWidth / 2, py: innerHeight / 2, lastScrollY: scrollY,
    expr: 'smile', exprUntil: 0, talking: false, blinkAt: performance.now() + 2500, blinkEnd: 0,
    wob: 0, wobV: 0
  };

  /* ---------- sound ---------- */
  const VOICE = window.SANJU_VOICE || {};
  const VOICE_BY_FILE = {}; Object.keys(VOICE).forEach(t => { VOICE_BY_FILE[VOICE[t].f] = t; });
  const Sound = {
    on: true, ctx: null, master: null, voiceOut: null, analyser: null, unlocked: false,
    bufs: {}, loading: {},
    broken: false,
    /* rebuild the audio engine if the browser broke it (e.g. headphones or the sound device changed) */
    rebuild() {
      try { if (this.ctx && this.ctx.state !== 'closed') this.ctx.close(); } catch (e) {}
      this.ctx = null; this.unlocked = false; this.broken = false;
      this.unlock();
    },
    unlock() {
      if (this.unlocked && (this.broken || !this.ctx || this.ctx.state === 'closed' || this.ctx.state === 'interrupted')) return this.rebuild();
      if (this.unlocked) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.ctx.onerror = () => { this.broken = true; };
        this.ctx.onstatechange = () => { if (this.ctx && (this.ctx.state === 'closed' || this.ctx.state === 'interrupted')) this.broken = true; };
        this.master = this.ctx.createGain();
        this.master.gain.value = this.on ? 0.5 : 0; this.master.connect(this.ctx.destination);
        /* recorded voice: louder than the little effect sounds, and measured for the mouth */
        this.voiceOut = this.ctx.createGain(); this.voiceOut.gain.value = 1.8;
        this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 512; this._lv = new Float32Array(512);
        this.voiceOut.connect(this.analyser); this.analyser.connect(this.master);
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.unlocked = true;
        if (!this._preloaded) { this._preloaded = true; this.preload(['intro1', 'intro2', 'hero', 'about'].map(k => VOICE_BY_FILE[k + '.mp3']).filter(Boolean)); setTimeout(() => this.preload(Object.keys(VOICE)), 6000); }
      } catch (e) {}
    },
    set(on) {
      this.on = on;
      if (this.master) this.master.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.03);
      try { sessionStorage.setItem('sjSound', on ? '1' : '0'); } catch (e) {}
    },
    /* fetch + decode one recorded line; resolves to an AudioBuffer or null */
    load(text) {
      const v = VOICE[text]; if (!v || !this.ctx) return Promise.resolve(null);
      if (this.bufs[v.f]) return Promise.resolve(this.bufs[v.f]);
      if (!this.loading[v.f]) {
        this.loading[v.f] = fetch(/^https?:/.test(v.f) ? v.f : 'audio/' + v.f).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
          .then(a => new Promise((res, rej) => { const p = this.ctx.decodeAudioData(a, res, rej); if (p && p.then) p.then(res, rej); }))
          .then(b => (this.bufs[v.f] = b)).catch(() => { delete this.loading[v.f]; return null; });
      }
      return this.loading[v.f];
    },
    preload(texts) { texts.forEach((t, i) => setTimeout(() => this.load(t), i * 120)); },
    level() {
      if (!this.analyser) return 0; const a = this._lv;
      if (this.analyser.getFloatTimeDomainData) this.analyser.getFloatTimeDomainData(a);
      else { const b = new Uint8Array(a.length); this.analyser.getByteTimeDomainData(b); for (let i = 0; i < b.length; i++) a[i] = (b[i] - 128) / 128; }
      let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s / a.length);
    },
    tone(f0, f1, dur, type = 'sine', vol = 0.25, delay = 0) {
      if (!this.unlocked || !this.on) return;
      const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
    },
    /* wordless voice: one soft syllable per word */
    syllable(i) { const base = 430 + ((i * 97) % 5) * 46; this.tone(base, base * (i % 2 ? 1.18 : 0.86), 0.11, 'triangle', 0.16); },
    mm() { this.tone(210, 250, 0.32, 'sine', 0.22); this.tone(420, 500, 0.32, 'sine', 0.05); },
    hm() { this.tone(240, 360, 0.28, 'sine', 0.2); },
    ooh() { this.tone(330, 620, 0.34, 'sine', 0.22); },
    giggle() { [0, 0.09, 0.18, 0.27].forEach((d, i) => this.tone(640 + i * 70, 760 + i * 70, 0.07, 'triangle', 0.16, d)); },
    sigh() { this.tone(360, 170, 0.6, 'sine', 0.14); },
    pop() { this.tone(520, 880, 0.09, 'sine', 0.2); },
    whoosh() {
      if (!this.unlocked || !this.on) return;
      const c = this.ctx, n = c.createBufferSource(), len = c.sampleRate * 0.45, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(300, c.currentTime); f.frequency.exponentialRampToValueAtTime(2400, c.currentTime + 0.3);
      const g = c.createGain(); g.gain.value = 0.18; n.buffer = b; n.connect(f); f.connect(g); g.connect(this.master); n.start();
    }
  };
  /* sound starts ON for every new visit; muting only lasts for this visit */
  try { localStorage.removeItem('sjSound'); if (sessionStorage.getItem('sjSound') === '0') Sound.on = false; } catch (e) {}

  /* ---------- face ---------- */
  function setEyes(l, r) { [[eyeL, l], [eyeR, r]].forEach(([e, k]) => { e.classList.toggle('arc', k === 'arc'); e.classList.toggle('line', k === 'line'); e.dataset.sy = k === 'wide' ? 1.16 : k === 'sleepy' ? 0.55 : 1; }); }
  function setMouth(k) { mouth.classList.toggle('open', k === 'open' || k === 'o'); mouth.classList.toggle('flat', k === 'flat'); mOpen.setAttribute('ry', k === 'o' ? 3.4 : 2.2); mOpen.setAttribute('rx', k === 'o' ? 2.6 : 2.8); }
  const EXPR = {
    smile: () => { setEyes('open', 'open'); setMouth('smile'); },
    happy: () => { setEyes('arc', 'arc'); setMouth('smile'); },
    wink: () => { setEyes('open', 'arc'); setMouth('smile'); },
    surprised: () => { setEyes('wide', 'wide'); setMouth('o'); },
    curious: () => { setEyes('wide', 'open'); setMouth('flat'); },
    skeptic: () => { setEyes('sleepy', 'open'); setMouth('flat'); },
    sleepy: () => { setEyes('line', 'line'); setMouth('flat'); },
    smug: () => { setEyes('arc', 'arc'); setMouth('smile'); }
  };
  function express(name, ms) {
    S.expr = name; (EXPR[name] || EXPR.smile)();
    S.exprUntil = ms ? performance.now() + ms : 0;
  }
  function lookAt(x, y, ms) { S.tLookX = Math.max(-1, Math.min(1, x)); S.tLookY = Math.max(-1, Math.min(1, y)); S.lookUntil = performance.now() + (ms || 1200); }
  function lookToward(el, ms) {
    if (!el) return; const r = el.getBoundingClientRect();
    lookAt((r.left + r.width / 2 - S.x) / 320, (r.top + r.height / 2 - S.y) / 320, ms);
  }

  /* ---------- speaking ---------- */
  let sayToken = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function fill(el, text, on) {
    el.textContent = '';
    const words = text.split(' ').map(w => { const s = document.createElement('span'); s.className = on ? 'w on' : 'w'; s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(' ')); return s; });
    el.classList.add('show'); return words;
  }
  /* recorded voice: words and mouth follow the audio clock, so they cannot drift */
  let voiceSrc = null;
  function stopVoice() { if (voiceSrc) { try { voiceSrc.onended = null; voiceSrc.stop(); } catch (e) {} voiceSrc = null; } }
  async function spoken(text, words, my) {
    const v = VOICE[text];
    if (!v || !Sound.on || !Sound.unlocked) return false;
    if (Sound.broken || !Sound.ctx || Sound.ctx.state === 'closed' || Sound.ctx.state === 'interrupted') Sound.rebuild();
    if (!Sound.ctx) return false;
    if (Sound.ctx.state === 'suspended') { try { await Promise.race([Sound.ctx.resume(), wait(400)]); } catch (e) {} }
    if (Sound.ctx.state !== 'running') return false;
    const buf = await Promise.race([Sound.load(text), wait(2500).then(() => null)]);
    if (!buf || my !== sayToken || !Sound.on) return false;
    stopVoice();
    const c = Sound.ctx, src = c.createBufferSource(); src.buffer = buf; src.connect(Sound.voiceOut);
    let ended = false; src.onended = () => { ended = true; };
    const t0 = c.currentTime + 0.03; src.start(t0); voiceSrc = src;
    S.talking = true; S.mouthMode = 'voice';
    const endMs = v.d + 60;
    let lastT = c.currentTime, lastMove = performance.now(), stalled = false;
    while (my === sayToken && !ended) {
      /* if the audio clock stops (device error), give up on the voice instead of freezing */
      if (c.currentTime !== lastT) { lastT = c.currentTime; lastMove = performance.now(); }
      else if (performance.now() - lastMove > 700) { stalled = true; Sound.broken = true; try { src.stop(); } catch (e) {} break; }
      const ms = (c.currentTime - t0) * 1000;
      for (let i = 0; i < words.length; i++) if ((v.w[i] ?? 0) <= ms) words[i].classList.add('on');
      const lv = Sound.level(); S.mouthLv = lv; S.mouthOpen = lv > 0.03;
      if (ms > endMs) break;
      await wait(30);
    }
    S.mouthOpen = false;
    if (voiceSrc === src) voiceSrc = null;
    if (stalled) return false;
    return my === sayToken;
  }
  async function timed(words, my, silent) {
    for (let i = 0; i < words.length; i++) {
      if (my !== sayToken) return false;
      words[i].classList.add('on'); S.mouthBeat = performance.now();
      if (!silent) Sound.syllable(i);
      const w = words[i].textContent, pause = /[.!?]$/.test(w) ? 330 : /,$/.test(w) ? 150 : 0;
      await wait((silent ? 150 + w.length * 46 : 120 + w.length * 34) + pause);
    }
    return my === sayToken;
  }
  async function say(text, opts = {}) {
    const el = opts.el || (S.anchor && S.anchor.parentElement && S.anchor.parentElement.querySelector('.seat-line'));
    if (!el || !text) return false;
    const my = ++sayToken;
    const words = fill(el, text, false);
    S.talking = false; S.mouthMode = 'timer'; express('smile');
    if (opts.watch) lookToward(opts.watch, 4000);
    let done = false;
    if (VOICE[text] && Sound.on && Sound.unlocked) {
      done = await spoken(text, words, my);
      if (my !== sayToken) return false;
    }
    /* no recording, or sound off: silent word-by-word reveal (never the old blip voice) */
    if (!done) { S.talking = true; S.mouthMode = 'timer'; await wait(140); if (!(await timed(words, my, true))) return false; }
    words.forEach(w => w.classList.add('on'));
    S.talking = false; S.mouthMode = 'timer'; setMouth('smile');
    if (opts.look) express(opts.look, 1700);
    return true;
  }
  function hush() { sayToken++; S.talking = false; setMouth('smile'); stopVoice(); }

  /* ---------- movement ---------- */
  function target() {
    const a = S.anchor;
    if (!a || !a.isConnected) return null;
    const r = a.getBoundingClientRect();
    if (!r.width) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width };
  }
  function setAnchor(el, kind) {
    if (S.anchor === el) return false;
    const far = S.placed && el && S.anchor && Math.hypot(...(() => { const r = el.getBoundingClientRect(); return [r.left - S.x, r.top - S.y]; })()) > 260;
    S.anchor = el; S.anchorKind = kind || '';
    S.travelUntil = performance.now() + 900;
    if (far) Sound.whoosh();
    return true;
  }
  function place() { const t = target(); if (t) { S.x = t.x; S.y = t.y; S.s = t.s; S.vx = S.vy = S.vs = 0; S.placed = true; } }
  function hop(power = 1) { S.vy -= 620 * power; S.wobV += 5 * power; Sound.pop(); }
  function spinKick(v = 900) { S.spin += v; S.wobV += 7; }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.034, (now - last) / 1000); last = now;
    const t = target();
    if (t) {
      if (!S.placed || reduce) { S.x = t.x; S.y = t.y; S.s = t.s; S.placed = true; }
      else {
        const travelling = now < (S.travelUntil || 0);
        const k = travelling ? 95 : 300, c = travelling ? 15.5 : 30;
        S.vx += (k * (t.x - S.x) - c * S.vx) * dt; S.vy += (k * (t.y - S.y) - c * S.vy) * dt;
        S.vs += (150 * (t.s - S.s) - 19 * S.vs) * dt;
        S.x += S.vx * dt; S.y += S.vy * dt; S.s += S.vs * dt;
      }
    }
    /* petals: constant spin with inertia from scrolling and taps */
    const sy = scrollY, dy = sy - S.lastScrollY; S.lastScrollY = sy;
    if (!reduce) {
      S.spin += dy * 2.2;
      S.spin = Math.max(-1400, Math.min(1400, S.spin));
      S.spin += (S.spinBase - S.spin) * Math.min(1, dt * 1.6);
      S.angle = (S.angle + S.spin * dt) % 360;
      S.sheen = (S.sheen - 38 * dt - S.spin * dt * 0.35) % 360;
    }
    /* wobble */
    S.wobV += (-90 * S.wob - 7 * S.wobV) * dt; S.wob += S.wobV * dt;
    /* squash and stretch along the direction of travel */
    const sp = Math.hypot(S.vx, S.vy), st = reduce ? 0 : Math.min(0.2, sp / 3600), ang = Math.atan2(S.vy, S.vx) * 180 / Math.PI;
    const size = Math.max(8, S.s), h = size * RATIO;
    root.style.width = size + 'px'; root.style.height = h + 'px';
    root.style.transform = `translate3d(${S.x - size / 2}px,${S.y - h / 2}px,0)`;
    body.style.transform = `rotate(${ang}deg) scale(${1 + st},${1 - st * 0.75}) rotate(${-ang}deg) rotate(${S.wob * 6}deg)`;
    petals.style.transform = `rotate(${S.angle}deg)`;
    sheen.style.setProperty('--sheen', S.sheen + 'deg');
    root.style.setProperty('--sh', (1 - Math.min(0.5, Math.abs(S.vy) / 2600)).toFixed(3));

    /* eyes: follow a target, or the pointer, with a little lag */
    let lx, ly;
    if (now < S.lookUntil) { lx = S.tLookX; ly = S.tLookY; }
    else { lx = Math.max(-1, Math.min(1, (S.px - S.x) / 420)); ly = Math.max(-1, Math.min(1, (S.py - S.y) / 420)); }
    lx += Math.max(-0.5, Math.min(0.5, -S.vx / 2200)); ly += Math.max(-0.5, Math.min(0.5, -S.vy / 2200));
    S.lookX += (lx - S.lookX) * Math.min(1, dt * 9); S.lookY += (ly - S.lookY) * Math.min(1, dt * 9);
    const fx = S.lookX * 4.2, fy = S.lookY * 3.4, narrow = 1 - Math.abs(S.lookX) * 0.14;
    lookG.setAttribute('transform', `translate(${fx.toFixed(2)} ${fy.toFixed(2)})`);
    /* blink */
    if (now > S.blinkAt) { S.blinkEnd = now + 130; S.blinkAt = now + 2400 + Math.random() * 3800; }
    const blink = now < S.blinkEnd ? 0.08 : 1;
    [[eyeL, 42], [eyeR, 58]].forEach(([e, cx]) => e.setAttribute('transform', `translate(${cx} 51) scale(${narrow.toFixed(3)} ${(blink * (+e.dataset.sy || 1)).toFixed(3)})`));
    /* mouth while talking */
    if (S.talking) { const open = S.mouthMode === 'voice' ? !!S.mouthOpen : (now - (S.mouthBeat || 0)) < 110; mouth.classList.toggle('open', open); if (open) mOpen.setAttribute('ry', S.mouthMode === 'voice' ? (1.5 + Math.min(2.1, (S.mouthLv || 0) * 22)).toFixed(2) : 2.4); }
    if (S.exprUntil && now > S.exprUntil && !S.talking) express('smile');
    requestAnimationFrame(frame);
  }

  addEventListener('pointermove', e => { S.px = e.clientX; S.py = e.clientY; }, { passive: true });
  if (reduce) petals.style.transform = 'none';
  express('smile');
  requestAnimationFrame(frame);

  window.Sanju = {
    S, Sound, say, hush, fill, token: () => sayToken, express, lookAt, lookToward, setAnchor, place, hop, spinKick, body, root,
    showFace(on) { root.classList.toggle('face', on); },
    doze(on) { root.classList.toggle('doze', on); if (on) { express('sleepy'); Sound.sigh(); } else express('smile'); }
  };
})();
