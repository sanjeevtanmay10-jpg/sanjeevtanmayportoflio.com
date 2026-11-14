(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { projects, lines } = window.SITE, SJ = window.Sanju;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const home = $('#home'), projView = $('#project'), gate = $('#gate');
  const pick = (arr, key) => { const i = (pick[key] = ((pick[key] ?? -1) + 1) % arr.length); return arr[i]; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const ARROW = '<svg class="go" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';

  /* ---------- project cards ---------- */
  const cards = $('#cards');
  projects.forEach(p => {
    const a = el('a', 'card reveal'); a.href = '#' + p.id; a.dataset.proj = p.id;
    const im = el('div', 'card-img'); const img = el('img'); img.src = 'img/' + p.cover; img.alt = p.alt; img.loading = 'lazy'; im.appendChild(img);
    const h = el('h3'); h.innerHTML = `<span class="num">${p.n}</span>`; h.appendChild(document.createTextNode(p.name)); h.insertAdjacentHTML('beforeend', ARROW);
    a.append(im, h, el('p', '', p.line)); cards.appendChild(a);
    const tell = () => { if (SJ.S.anchorKind === 'projects' && !introRunning) speak(p.hover, { look: 'wink', watch: a }); };
    a.addEventListener('pointerenter', tell); a.addEventListener('focus', tell);
  });

  /* ---------- project pages ---------- */
  function renderProject(p) {
    const i = projects.indexOf(p), next = projects[i + 1];
    projView.innerHTML = '';
    const s = el('section', 'proj wrap');
    s.innerHTML = `<a class="back" href="#projects"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>All projects</a>
      <div class="seat" data-seat="proj-top" data-look="happy"><span class="seat-spot"></span><p class="seat-line" aria-live="polite"></p></div>`;
    const h = el('h1', 'proj-title reveal'); h.innerHTML = `<span class="num">${p.n}</span>`; h.appendChild(document.createTextNode(p.name));
    const sum = el('p', 'proj-sum reveal', p.sum);
    const dl = el('dl', 'proj-facts reveal');
    p.facts.forEach(([k, v]) => { const d = el('div'); d.append(el('dt', 'label', k), el('dd', '', v)); dl.appendChild(d); });
    const study = el('div', 'study');
    p.tiles.forEach((t, n) => { const img = el('img'); img.src = 'img/' + t.src; img.width = t.w; img.height = t.h; img.alt = n === 0 ? p.name + ' case study' : ''; if (n > 0) img.loading = 'lazy'; study.appendChild(img); });
    const end = el('div', 'wrap');
    end.innerHTML = `<div class="seat" data-seat="proj-end" data-look="wink" style="margin-top:56px"><span class="seat-spot"></span><p class="seat-line" aria-live="polite"></p></div>`;
    const btns = el('div', 'proj-end');
    if (next) { const n = el('a', 'btn btn-dark', 'Next: ' + next.name); n.href = '#' + next.id; btns.appendChild(n); }
    const b = el('a', 'btn btn-line', 'Back to all projects'); b.href = '#projects'; btns.appendChild(b);
    const r = el('a', 'btn btn-line', 'Leave a review'); r.href = '#reviews'; btns.appendChild(r);
    end.appendChild(btns);
    s.append(h, sum, dl); const sw = el('div', 'wrap'); sw.appendChild(study); projView.append(s, sw, end);
    projView.dataset.top = p.top; projView.dataset.end = p.end; projView.dataset.name = p.name;
    document.title = p.name + ' — Sanjeev Tanmay';
  }

  /* ---------- routing (plain #names only) ---------- */
  const SECTIONS = ['top', 'about', 'live', 'projects', 'reviews', 'contact'];
  let currentView = 'home', seats = [], said = new Set();
  function route(first) {
    const id = (location.hash || '#top').slice(1), p = projects.find(x => x.id === id);
    closeMenu();
    if (p) {
      renderProject(p); home.hidden = true; projView.hidden = false; currentView = id;
      window.scrollTo(0, 0);
    } else {
      const was = currentView; home.hidden = false; projView.hidden = true; currentView = 'home';
      document.title = 'Sanjeev Tanmay — UX/UI designer';
      const target = document.getElementById(SECTIONS.includes(id) ? id : 'top');
      if (was !== 'home' || first) { const y = target.id === 'top' ? 0 : target.getBoundingClientRect().top + scrollY - 70; window.scrollTo(0, y); }
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    seats = $$('.view:not([hidden]) .seat'); said = currentView === 'home' ? saidHome : new Set();
    observeReveals();
    SJ.hush(); seats.forEach(showMain); pickAnchor(true);
  }
  const saidHome = new Set();
  addEventListener('hashchange', () => route(false));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    if (a.getAttribute('href') === location.hash) { e.preventDefault(); route(false); }
  });

  /* ---------- reveal on scroll ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function observeReveals() { $$('.view:not([hidden]) .reveal:not(.in)').forEach(n => io ? io.observe(n) : n.classList.add('in')); }

  /* ---------- menu ---------- */
  const menuBtn = $('#menuBtn'), menu = $('#menu');
  function openMenu() { clearTimeout(closeTimer); document.body.classList.remove('menu-closing'); document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); menu.setAttribute('aria-hidden', 'false'); $('.menu-word').textContent = 'Close'; setTimeout(() => $('a', menu).focus(), 350); SJ.Sound.pop(); }
  let closeTimer = 0;
  function closeMenu(focus) { if (!document.body.classList.contains('menu-open')) return; document.body.classList.remove('menu-open'); document.body.classList.add('menu-closing'); clearTimeout(closeTimer); closeTimer = setTimeout(() => document.body.classList.remove('menu-closing'), reduce ? 0 : 880); menuBtn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); $('.menu-word').textContent = 'Menu'; if (focus) menuBtn.focus(); }
  menuBtn.addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu(true) : openMenu());
  addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu(true);
    if (e.key === 'Tab' && document.body.classList.contains('menu-open')) {
      const f = [menuBtn, ...$$('a', menu)], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- sound button ---------- */
  const soundBtn = $('#soundBtn');
  function paintSound() { soundBtn.setAttribute('aria-pressed', SJ.Sound.on ? 'true' : 'false'); soundBtn.setAttribute('aria-label', SJ.Sound.on ? 'Mute Sanju' : 'Turn on Sanju’s sound'); }
  soundBtn.addEventListener('click', () => { SJ.Sound.unlock(); SJ.Sound.set(!SJ.Sound.on); paintSound(); if (SJ.Sound.on) SJ.Sound.mm(); });
  paintSound();
  addEventListener('pointerdown', () => SJ.Sound.unlock(), { once: true, passive: true });
  addEventListener('keydown', () => SJ.Sound.unlock(), { once: true });

  /* ---------- guide on/off ---------- */
  const guideToggle = $('#guideToggle');
  function setGuide(on) { document.body.classList.toggle('guide-off', !on); guideToggle.setAttribute('aria-pressed', on ? 'true' : 'false'); guideToggle.textContent = on ? 'Guide on' : 'Guide off'; store.set('sjGuide', on ? '1' : '0'); if (!on) SJ.hush(); }
  guideToggle.addEventListener('click', () => setGuide(document.body.classList.contains('guide-off')));
  if (store.get('sjGuide') === '0') setGuide(false);

  /* ---------- Sanju: seats, lines, reactions ---------- */
  let introRunning = false, lastAct = performance.now(), nudged = new Set(), dozing = false;
  const perch = $('#perch');
  function seatOf() { const a = SJ.S.anchor; return a && a.closest ? a.closest('.seat') : null; }
  /* every seat always shows its own line; dark once Sanju has said it */
  function showMain(seat) { if (!seat) return; const t = lineFor(seat), e = seat.querySelector('.seat-line'); if (t && e) SJ.fill(e, t, seat.dataset.done === '1'); }
  function speak(text, opts) {
    if (document.body.classList.contains('guide-off')) return Promise.resolve(false);
    wake(); const seat = seatOf(), p = SJ.say(text, opts), tok = SJ.token();
    /* tap, nudge and helper lines are temporary: the section's own line comes back */
    if (!(opts && opts.main)) p.then(ok => { if (ok && seat) setTimeout(() => { if (SJ.token() === tok) showMain(seat); }, 2600); });
    return p;
  }
  function lineFor(seat) {
    const k = seat.dataset.seat;
    if (k === 'proj-top') return projView.dataset.top;
    if (k === 'proj-end') return projView.dataset.end;
    return lines[k];
  }
  let pendTimer = 0, pendSeat = null;
  function arrive(seat) {
    pendSeat = seat; clearTimeout(pendTimer);
    pendTimer = setTimeout(() => {
      pendSeat = null;
      if (introRunning || seatOf() !== seat || document.body.classList.contains('menu-open')) return;
      const kind = seat.dataset.seat, key = currentView + ':' + kind, e = seat.querySelector('.seat-line');
      if (!said.has(key)) speak(lineFor(seat), { look: seat.dataset.look, el: e, main: true }).then(ok => { if (ok) { said.add(key); seat.dataset.done = '1'; } });
      else if (lines.ret[kind]) speak(lines.ret[kind], { look: seat.dataset.look, el: e });
    }, 420);
  }
  function pickAnchor(force) {
    if (introRunning) return;
    const vh = innerHeight; let best = null, bestD = 1e9;
    seats.forEach(s => {
      const r = s.querySelector('.seat-spot').getBoundingClientRect();
      if (!r.width) return;
      const c = r.top + r.height / 2;
      if (c < 96 || c > vh - 40) return;
      const d = Math.abs(c - vh * 0.36); if (d < bestD) { bestD = d; best = s; }
    });
    const prev = seatOf();
    if (best) {
      const changed = SJ.setAnchor(best.querySelector('.seat-spot'), best.dataset.seat);
      if (force && !SJ.S.placed) SJ.place();
      if (changed) { SJ.hush(); if (prev && prev !== best) showMain(prev); arrive(best); }
      else if (force) arrive(best);
    } else {
      if (SJ.setAnchor(perch, 'perch')) { SJ.hush(); showMain(prev); clearTimeout(pendTimer); pendSeat = null; }
      if (force && !SJ.S.placed) SJ.place();
    }
  }
  let ticking = false;
  addEventListener('scroll', () => { act(); if (pendSeat) arrive(pendSeat); if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; pickAnchor(false); }); } }, { passive: true });
  addEventListener('resize', () => pickAnchor(false));
  function act() { lastAct = performance.now(); wake(); }
  function wake() { if (dozing) { dozing = false; SJ.doze(false); } }
  ['pointerdown', 'keydown', 'pointermove'].forEach(t => addEventListener(t, act, { passive: true }));

  setInterval(() => {
    if (introRunning || document.hidden || document.body.classList.contains('guide-off') || document.body.classList.contains('menu-open')) return;
    const idle = performance.now() - lastAct, kind = SJ.S.anchorKind;
    if (SJ.S.talking || kind === 'perch') return;
    const key = currentView + ':' + kind;
    if (idle > 11000 && !nudged.has(key) && !['contact', 'proj-end', 'reviews'].includes(kind)) { nudged.add(key); SJ.hop(); speak(pick(lines.nudge, 'n'), { look: 'curious' }); }
    else if (idle > 26000 && !dozing) { dozing = true; SJ.doze(true); }
    else if (idle > 6000 && idle < 26000 && Math.random() < 0.12 && !dozing) { SJ.lookAt(Math.random() * 2 - 1, Math.random() * .8 - .4, 1300); }
  }, 1000);

  SJ.body.addEventListener('click', () => {
    if (introRunning) return;
    SJ.Sound.unlock(); SJ.spinKick(1100); SJ.hop(.6); SJ.Sound.giggle(); SJ.express('happy', 1500);
    if (SJ.S.anchorKind !== 'perch') speak(pick(lines.tap, 't'), { look: 'happy' });
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !introRunning && performance.now() - lastAct > 20000 && SJ.S.anchorKind !== 'perch') { act(); SJ.hop(.7); speak(pick(lines.back, 'b'), { look: 'happy' }); } });
  $('#mailBtn').addEventListener('click', () => { if (SJ.S.anchorKind === 'contact') speak(lines.mail, { look: 'wink' }); });

  /* ---------- likes, reviews, visits (Supabase) ---------- */
  const SB_URL = 'https://cajggcdngoguhwnmbdxz.supabase.co', SB_KEY = 'sb_publishable_ks_xfngTOL-vWORAJ6UNOg_su1mfufx'; /* publishable key: safe in the browser */
  const likeBtn = $('#likeBtn'), likeText = $('#likeText'), form = $('#reviewForm'), rvStatus = $('#rvStatus'), revList = $('#revList');
  const stat = { visits: $('#statVisits'), likes: $('#statLikes'), reviews: $('#statReviews') };
  let online = false, liked = false, busyLike = false;
  const visitor = (() => {
    let v = null; try { v = localStorage.getItem('sjVisitor'); } catch (e) {}
    if (!v || !/^[0-9a-f-]{36}$/i.test(v)) {
      v = (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
      try { localStorage.setItem('sjVisitor', v); } catch (e) {}
    }
    return v;
  })();
  async function rpc(fn, args) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(SB_URL + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}), signal: ctl.signal });
      const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
      if (!r.ok) { const err = new Error((j && j.message) || 'failed'); err.code = j && j.code; throw err; }
      return j;
    } finally { clearTimeout(to); }
  }
  function setStat(k, n) { const d = stat[k], v = String(n); d.classList.remove('na'); if (d.textContent !== v) { d.textContent = v; d.classList.remove('bump'); void d.offsetWidth; d.classList.add('bump'); } }
  function offline() { const n = $('#liveNote'); n.hidden = false; Object.values(stat).forEach(d => d.classList.add('na')); n.textContent = 'Live counts are taking a break. Try again in a moment.'; }
  function paintLike() { likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false'); likeText.textContent = liked ? 'You liked this site' : 'Like this site'; }
  function reviewCard(r) {
    const c = el('article', 'rev'), m = el('div', 'rev-meta');
    m.append(el('span', 'rev-name', r.name || 'Someone'), el('span', 'rev-proj', 'on ' + (r.project || 'the site')));
    c.append(m, el('p', 'rev-text', r.body || '')); return c;
  }
  function paintReviews(list) {
    revList.innerHTML = '';
    if (!list.length) { const e = el('div', 'empty'); e.append(el('p', 'empty-title', 'No reviews yet'), el('p', 'muted', 'Approved reviews show here, newest first.')); revList.appendChild(e); }
    list.forEach(r => revList.appendChild(reviewCard(r)));
  }
  function apply(site) {
    if (!site) return; online = true; $('#liveNote').hidden = true;
    setStat('visits', site.visits); setStat('likes', site.likes); setStat('reviews', site.reviews);
    if (!busyLike) { liked = !!site.liked; paintLike(); }
    paintReviews(site.list || []);
  }
  async function refresh() { try { apply(await rpc('get_site', { p_visitor: visitor })); } catch (e) { if (!online) offline(); } }
  async function initData() {
    try { await rpc('record_visit', { p_visitor: visitor }); } catch (e) {}
    await refresh();
    setInterval(() => { if (!document.hidden) refresh(); }, 45000);
  }
  function burstHearts() {
    if (reduce || document.body.classList.contains('guide-off')) return;
    const { x, y, s: size } = SJ.S;
    for (let i = 0; i < 9; i++) {
      const h = document.createElement('div'), sz = 12 + Math.random() * 12, ang = -Math.PI / 2 + (i - 4) * 0.42 + (Math.random() - .5) * .3, r0 = size * .45, r1 = size * (.95 + Math.random() * .7);
      h.className = 'fly-heart';
      h.innerHTML = `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`;
      document.body.appendChild(h);
      const p = (r, up) => `translate(${x + Math.cos(ang) * r - sz / 2}px,${y + Math.sin(ang) * r - sz / 2 - up}px)`;
      h.animate([{ transform: p(r0, 0) + ' scale(.2)', opacity: 0 }, { transform: p((r0 + r1) / 2, 6) + ' scale(1.15)', opacity: 1, offset: .35 }, { transform: p(r1, 34) + ' scale(.9)', opacity: 0 }], { duration: 1300 + Math.random() * 500, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }).onfinish = () => h.remove();
    }
  }
  let breakTimer = 0;
  function likeFx(nowLiked) {
    clearTimeout(breakTimer); likeBtn.classList.remove('breaking');
    if (nowLiked) {
      SJ.hop(.7); SJ.spinKick(700); SJ.Sound.giggle(); burstHearts();
      SJ.root.classList.add('shy'); SJ.lookAt(-.35, .7, 2600); setTimeout(() => SJ.root.classList.remove('shy'), 4200);
      if (SJ.S.anchorKind !== 'perch') speak(lines.like, { look: 'happy' });
    } else {
      void likeBtn.offsetWidth; likeBtn.classList.add('breaking'); SJ.Sound.sigh();
      breakTimer = setTimeout(() => likeBtn.classList.remove('breaking'), 1500);
      if (SJ.S.anchorKind !== 'perch') speak(lines.unlike, { look: 'curious' });
    }
  }
  window.__likeFx = likeFx;
  likeBtn.addEventListener('click', async () => {
    SJ.Sound.unlock();
    if (busyLike) return;
    busyLike = true; likeBtn.disabled = true;
    const want = !liked; liked = want; paintLike(); likeFx(want);
    try { const r = await rpc('set_like', { p_visitor: visitor, p_liked: want }); if (r && typeof r.likes === 'number') setStat('likes', r.likes); }
    catch (e) { liked = !want; paintLike(); speak(e.code === 'P0429' ? lines.rvLimit : lines.rvFail, { look: 'curious' }); }
    busyLike = false; likeBtn.disabled = false;
  });
  const rvName = $('#rvName'), rvText = $('#rvText');
  let toldName = false, toldText = false;
  rvName.addEventListener('focus', () => { if (!toldName && SJ.S.anchorKind === 'reviews') { toldName = true; speak(lines.rvName, { look: 'happy', watch: rvName }); } });
  rvText.addEventListener('focus', () => { if (!toldText && SJ.S.anchorKind === 'reviews') { toldText = true; speak(lines.rvText, { look: 'wink', watch: rvText }); } });
  rvText.addEventListener('input', () => { SJ.lookToward(rvText, 900); rvText.classList.remove('bad'); });
  rvName.addEventListener('input', () => rvName.classList.remove('bad'));
  form.addEventListener('submit', async e => {
    e.preventDefault(); SJ.Sound.unlock();
    const name = rvName.value.trim(), text = rvText.value.trim(), project = $('#rvProject').value;
    if (!name) { rvName.classList.add('bad'); rvName.focus(); rvStatus.textContent = 'Add your name to post.'; speak(lines.rvNoName, { look: 'curious', watch: rvName }); return; }
    if (!text) { rvText.classList.add('bad'); rvText.focus(); rvStatus.textContent = 'Write a few words before posting.'; speak(lines.rvEmpty, { look: 'skeptic', watch: rvText }); return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      await rpc('add_review', { p_visitor: visitor, p_name: name.slice(0, 60), p_project: project, p_body: text.slice(0, 600) });
      rvText.value = ''; rvStatus.textContent = 'Posted. It will appear once Sanjeev approves it.';
      SJ.hop(); SJ.spinKick(700); speak(lines.rvDone, { look: 'happy' });
    } catch (err) {
      if (err.code === 'P0429') { rvStatus.textContent = 'That’s the limit for today. Thank you!'; speak(lines.rvLimit, { look: 'happy' }); }
      else { rvStatus.textContent = 'That didn’t go through. Please try again.'; speak(lines.rvFail, { look: 'curious' }); }
    }
    btn.disabled = false;
  });

  /* ---------- start screen and intro ---------- */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let skip = null, gateTimer = 0, gateIdle = 0;
  async function intro() {
    clearTimeout(gateTimer); introRunning = true; document.body.classList.add('intro'); document.body.classList.remove('hdr-in');
    /* reset the start screen so the intro can be replayed */
    gate.classList.remove('out'); $('#gateUi').classList.remove('gone');
    const gl0 = $('#gateLine'); gl0.classList.remove('show'); gl0.textContent = '';
    gate.hidden = false;
    SJ.hush(); SJ.setAnchor($('#gateSpot'), 'gate'); SJ.place();
    SJ.showFace(true); SJ.express('smile');
    /* while waiting for "Come in": small looks and expressions so Sanju feels alive */
    const idle = [
      () => { SJ.lookToward($('#comeIn'), 1800); SJ.express('happy', 1400); },
      () => { SJ.lookAt(-.75, -.15, 1300); },
      () => { SJ.lookAt(.75, -.1, 1300); SJ.express('curious', 1300); },
      () => { SJ.lookToward($('#comeIn'), 1600); SJ.express('wink', 900); SJ.spinKick(260); },
      () => { SJ.lookToward($('#gateUi'), 1500); SJ.express('smile'); }
    ];
    let idleI = 0;
    clearInterval(gateIdle);
    SJ.lookToward($('#comeIn'), 1500);
    gateIdle = setInterval(() => { if (!introRunning || $('#gateUi').classList.contains('gone')) return clearInterval(gateIdle); idle[idleI++ % idle.length](); }, 2600);
    let wantSound = SJ.Sound.on;
    $$('[data-gate-sound]').forEach(b => { b.setAttribute('aria-pressed', (b.dataset.gateSound === 'on') === wantSound ? 'true' : 'false'); b.onclick = () => { wantSound = b.dataset.gateSound === 'on'; $$('[data-gate-sound]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); }; });
    const comeIn = $('#comeIn'); comeIn.focus({ preventScroll: true });
    let done = false;
    const finish = () => {
      if (done) return; done = true; clearInterval(gateIdle); SJ.hush();
      store.set('sjSeen', '1'); gate.classList.add('out'); document.body.classList.remove('intro', 'hdr-in');
      introRunning = false; SJ.showFace(true); SJ.express('smile'); paintSound();
      gateTimer = setTimeout(() => { gate.hidden = true; }, 950);
      SJ.S.placed = true; pickAnchor(true); observeReveals();
    };
    $('#skipIntro').onclick = () => { SJ.Sound.unlock(); SJ.Sound.set(wantSound); finish(); };
    await new Promise(res => { comeIn.onclick = () => { comeIn.onclick = null; res(); }; });
    if (done) return;
    clearInterval(gateIdle); SJ.Sound.unlock(); SJ.Sound.set(wantSound);
    $('#gateUi').classList.add('gone');
    const alive = async ms => { await wait(ms); return !done; };
    const gl = $('#gateLine');
    if (!(await alive(350))) return;
    SJ.showFace(true); SJ.express('surprised', 700); SJ.Sound.ooh(); SJ.hop(.5);
    if (!(await alive(750))) return; SJ.lookAt(-.9, .05, 480);
    if (!(await alive(480))) return; SJ.lookAt(.9, .05, 480);
    if (!(await alive(480))) return; SJ.lookAt(0, 0, 500); SJ.express('happy', 600);
    if (!(await alive(450))) return;
    if (!(await SJ.say(lines.intro1, { el: gl, look: 'wink' })) || done) return;
    if (!(await alive(500))) return;
    document.body.classList.add('hdr-in');
    if (!(await alive(350))) return;
    SJ.lookToward($('#brandPhoto'), 6000);
    if (!(await SJ.say(lines.intro2, { el: gl, watch: $('#brandPhoto') })) || done) return;
    SJ.express('smug', 1000); SJ.lookAt(.5, .5, 900);
    if (!(await alive(950))) return;
    gl.classList.remove('show');
    finish();
  }

  /* ---------- tapping the photo or name replays the start screen and Sanju's intro ---------- */
  $('.brand').addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    if (introRunning) return;
    if (location.hash !== '' && location.hash !== '#top') history.pushState(null, '', '#top');
    route(true); intro();
  });

  /* ---------- home icon: back to the top, and Sanju gives the hero line again ---------- */
  $('a.round[aria-label="Home"]').addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    if (introRunning) return;
    const hero = $('#home .seat[data-seat="hero"]');
    saidHome.delete('home:hero'); said.delete('home:hero'); if (hero) hero.dataset.done = '';
    if (currentView === 'home') { closeMenu(); SJ.hush(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); if (location.hash && location.hash !== '#top') history.pushState(null, '', '#top'); }
    else { history.pushState(null, '', '#top'); route(false); window.scrollTo(0, 0); }
    const t0 = performance.now();
    const wait = () => {
      if (scrollY > 4 && performance.now() - t0 < 2500) return requestAnimationFrame(wait);
      if (hero && !said.has('home:hero') && pendSeat !== hero) { pickAnchor(true); arrive(hero); }
    };
    requestAnimationFrame(wait);
  });

  /* ---------- go ---------- */
  initData();
  const startsOnProject = projects.some(p => '#' + p.id === location.hash);
  if (!store.get('sjSeen') && !reduce && !startsOnProject && store.get('sjGuide') !== '0') {
    introRunning = true; route(true); intro();
  } else {
    SJ.showFace(true); route(true);
  }
})();
