/* =====================================================================
   Interaction layer — preloader, reveals, countdown, nav, petals,
   card tilt, add-to-calendar, ambient tone.
   ===================================================================== */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WEDDING = new Date('2026-12-06T11:00:00+05:30');

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader').classList.add('done');
      document.body.classList.add('ready');
      kickReveals();
    }, 1400);
  });

  /* ---------- Scroll reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  function kickReveals() {
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    // hero reveals immediately
    document.querySelectorAll('#hero [data-reveal]').forEach((el) => el.classList.add('in'));
  }

  /* ---------- Scroll progress + active nav dot ---------- */
  const progress = document.getElementById('scrollProgress');
  const dots = [...document.querySelectorAll('.dotnav a')];
  const sections = dots.map((d) => document.querySelector(d.getAttribute('href')));

  function onScroll() {
    const st = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';

    const mid = st + window.innerHeight * 0.4;
    let idx = 0;
    sections.forEach((s, i) => { if (s && s.offsetTop <= mid) idx = i; });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    });
  });

  /* ---------- Countdown ---------- */
  const el = {
    d: document.getElementById('cdDays'),
    h: document.getElementById('cdHours'),
    m: document.getElementById('cdMins'),
    s: document.getElementById('cdSecs'),
  };
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    let diff = Math.max(0, WEDDING - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
    const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    if (el.d) { el.d.textContent = pad(d); el.h.textContent = pad(h);
                el.m.textContent = pad(m); el.s.textContent = pad(s); }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Add to calendar (.ics download) ---------- */
  const calBtn = document.getElementById('calBtn');
  if (calBtn) {
    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const dt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = new Date(WEDDING.getTime() + 60 * 60 * 1000);
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rilwan-Kashifa//Nikkah//EN',
        'BEGIN:VEVENT', 'UID:rilwan-kashifa-nikkah@2026',
        'DTSTAMP:' + dt(new Date()),
        'DTSTART:' + dt(WEDDING), 'DTEND:' + dt(end),
        'SUMMARY:Nikkah — Rilwan & Kashifa',
        'DESCRIPTION:With the blessings of Allah\\, join us for the Nikkah followed by lunch.',
        'LOCATION:Rani Mahal\\, Blue Lagoon Wedding Complex\\, 5/72 Raja Nagar\\, Neelankarai\\, Chennai 600115',
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'Rilwan-Kashifa-Nikkah.ics';
      a.click(); URL.revokeObjectURL(url);
    });
  }

  /* ---------- Card 3D tilt + glow ---------- */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform =
          `perspective(900px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg) translateY(-4px)`;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Floating petals ---------- */
  if (!reduce) {
    const wrap = document.getElementById('petals');
    const svg = `<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c3 4 7 6 7 11a7 7 0 1 1-14 0c0-5 4-7 7-11z"/></svg>`;
    const N = window.innerWidth < 640 ? 10 : 20;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.innerHTML = svg;
      const size = 8 + Math.random() * 14;
      p.style.left = Math.random() * 100 + 'vw';
      p.style.fontSize = size + 'px';
      p.style.opacity = 0.25 + Math.random() * 0.4;
      p.style.animationDuration = 10 + Math.random() * 16 + 's';
      p.style.animationDelay = -Math.random() * 20 + 's';
      wrap.appendChild(p);
    }
  }

  /* ---------- Hero parallax ---------- */
  if (!reduce) {
    const heroInner = document.querySelector('.hero__inner');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight && heroInner) {
        heroInner.style.transform = `translateY(${y * 0.25}px)`;
        heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
      }
    }, { passive: true });
  }

  /* ---------- Wedding chimes (opt-in, WebAudio — no external file) ---------- */
  const muteBtn = document.getElementById('muteToggle');
  let audioCtx = null, master = null, delay = null, chimeTimer = null, playing = false;

  // pleasant pentatonic bell scale (Hz) — C5 D5 E5 G5 A5 C6
  const CHIME_NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

  function buildAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    master = audioCtx.createGain();
    master.gain.value = 0.0;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 5200;
    // sparkle: gentle feedback delay
    delay = audioCtx.createDelay(1.0);
    delay.delayTime.value = 0.33;
    const fb = audioCtx.createGain(); fb.gain.value = 0.3;
    delay.connect(fb); fb.connect(delay);
    master.connect(lp);
    lp.connect(audioCtx.destination);
    lp.connect(delay);
    delay.connect(audioCtx.destination);
  }

  // one bell strike: fundamental + octave shimmer, fast attack, long decay
  function strike(freq, when, vel) {
    const o1 = audioCtx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
    const o2 = audioCtx.createOscillator(); o2.type = 'sine';     o2.frequency.value = freq * 2.01;
    const g  = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vel, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 2.4);
    const g2 = audioCtx.createGain(); g2.gain.value = 0.35;
    o1.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(master);
    o1.start(when); o2.start(when);
    o1.stop(when + 2.5); o2.stop(when + 2.5);
  }

  // gentle wedding melody in Mohanam raga (original, loops while playing)
  const MELODY = [
    [3,1],[4,1],[5,2],[4,1],[3,1],[2,2],
    [3,1],[2,1],[1,2],[0,2],
    [2,1],[3,1],[4,2],[3,1],[2,1],[1,2],[0,4]
  ];
  function scheduleChimes() {
    const beat = 0.42;
    const playPhrase = () => {
      if (!playing || !audioCtx) return;
      const start = audioCtx.currentTime + 0.06;
      let t = 0;
      for (const [idx, beats] of MELODY) {
        strike(CHIME_NOTES[idx], start + t * beat, 0.2);
        t += beats;
      }
      chimeTimer = setTimeout(playPhrase, (t * beat + 1.4) * 1000);
    };
    playPhrase();
  }

  muteBtn.addEventListener('click', () => {
    if (!audioCtx) buildAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playing = !playing;
    muteBtn.setAttribute('aria-pressed', String(playing));
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(playing ? 0.6 : 0.0, audioCtx.currentTime + 0.4);
    if (playing) scheduleChimes();
    else if (chimeTimer) { clearTimeout(chimeTimer); chimeTimer = null; }
  });

  /* ---------- Theme switch (blue / green) ---------- */
  const themeBtn = document.getElementById('themeSwitch');
  const themeLabel = document.getElementById('themeLabel');
  const root = document.documentElement;
  function applyTheme(theme) {
    const green = theme === 'green';
    if (green) root.setAttribute('data-theme', 'green');
    else root.removeAttribute('data-theme');
    if (themeBtn) themeBtn.setAttribute('aria-checked', String(green));
    if (themeLabel) themeLabel.textContent = green ? 'Green' : 'Blue';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', green ? '#08251b' : '#012540');
    window.dispatchEvent(new Event('themechange'));
  }
  applyTheme(localStorage.getItem('rk-theme') || 'blue');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'green' ? 'blue' : 'green';
      applyTheme(next);
      localStorage.setItem('rk-theme', next);
    });
  }
})();
