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
  const Sound = {
    on: true, ctx: null, master: null, tts: null, unlocked: false,
    unlock() {
      if (this.unlocked) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC(); this.master = this.ctx.createGain();
        this.master.gain.value = this.on ? 0.5 : 0; this.master.connect(this.ctx.destination);
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.unlocked = true;
      } catch (e) {}
      if (window.claude && claude.use) claude.use('tts').then(t => { this.tts = t; if (t && this._hook) this._hook(t); }).catch(() => {});
    },
    set(on) {
      this.on = on;
      if (this.master) this.master.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.03);
      if (!on && this.tts) { try { this.tts.stop(); } catch (e) {} }
      try { localStorage.setItem('sjSound', on ? '1' : '0'); } catch (e) {}
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
  try { if (localStorage.getItem('sjSound') === '0') Sound.on = false; } catch (e) {}

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
  const RATE = 1.05;
  function fill(el, text, on) {
    el.textContent = '';
    const words = text.split(' ').map(w => { const s = document.createElement('span'); s.className = on ? 'w on' : 'w'; s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(' ')); return s; });
    el.classList.add('show'); return words;
  }
  /* the voice reports how far it has got; text and mouth follow that, not a timer */
  const V = { ms: 0, at: 0, started: false, state: 'idle', callAt: 0 };
  function hookVoice(t) {
    try { t.onPosition(({ ms }) => { const now = performance.now(); if (!(ms > 0) || now - V.callAt < 120) return; if (!V.started && ms > 900) return; V.ms = ms; V.at = now; V.started = true; }); } catch (e) {}
    try { t.onState(({ state }) => { V.state = state; }); } catch (e) {}
  }
  function stopVoice() { if (Sound.tts) { try { Sound.tts.stop(); } catch (e) {} } }
  function timeline(words) {
    let t = 0; const starts = [], durs = [];
    words.forEach(s => { const w = s.textContent, d = (85 + 58 * w.replace(/[^\w']/g, '').length) / RATE; starts.push(t); durs.push(d); t += d + (/[.!?]$/.test(w) ? 320 : /,$/.test(w) ? 160 : 0) / RATE; });
    return { starts, durs, total: t };
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
    if (Sound.on && Sound.unlocked && Sound.tts) {
      V.started = false; V.ms = 0; V.callAt = performance.now();
      let ended = false, failed = false, p = null;
      try { p = Sound.tts.speak(text, { voice: 'airy', rate: RATE, language: 'en' }); } catch (e) { failed = true; }
      if (p && p.then) p.then(() => { ended = true; }, () => { if (!V.started) failed = true; ended = true; });
      const tl = timeline(words), t0 = performance.now();
      while (my === sayToken) {
        if (!V.started) {
          if (failed) break;
          if (ended) { done = true; break; }
          if (performance.now() - t0 > 3000) {
            if (V.state === 'speaking') { S.talking = true; if (!(await timed(words, my, true))) return false; done = true; }
            else stopVoice();
            break;
          }
          await wait(40); continue;
        }
        S.talking = true; S.mouthMode = 'voice';
        const ms = V.ms + Math.min(350, performance.now() - V.at);
        let cur = -1;
        for (let i = 0; i < words.length; i++) { if (tl.starts[i] <= ms) { words[i].classList.add('on'); cur = i; } else break; }
        S.mouthOpen = cur >= 0 && ms < tl.starts[cur] + tl.durs[cur] && ((ms - tl.starts[cur]) % 180) < 105;
        if (ended || ms > tl.total + 2500) { done = true; break; }
        await wait(33);
      }
      if (my !== sayToken) return false;
    }
    if (!done) { S.talking = true; S.mouthMode = 'timer'; await wait(140); if (!(await timed(words, my, false))) return false; }
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
    if (S.talking) { const open = S.mouthMode === 'voice' ? !!S.mouthOpen : (now - (S.mouthBeat || 0)) < 110; mouth.classList.toggle('open', open); if (open) mOpen.setAttribute('ry', 2.4); }
    if (S.exprUntil && now > S.exprUntil && !S.talking) express('smile');
    requestAnimationFrame(frame);
  }

  addEventListener('pointermove', e => { S.px = e.clientX; S.py = e.clientY; }, { passive: true });
  if (reduce) petals.style.transform = 'none';
  express('smile');
  requestAnimationFrame(frame);

  Sound._hook = hookVoice;
  window.Sanju = {
    S, Sound, say, hush, fill, token: () => sayToken, express, lookAt, lookToward, setAnchor, place, hop, spinKick, body, root,
    showFace(on) { root.classList.toggle('face', on); },
    doze(on) { root.classList.toggle('doze', on); if (on) { express('sleepy'); Sound.sigh(); } else express('smile'); }
  };
})();
