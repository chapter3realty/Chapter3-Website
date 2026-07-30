
(function() {
'use strict';

// ── HELPERS ──────────────────────────────────────────────
const qs  = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

// ── CURSOR - navy pointer ────────────────────────────────
const dot = qs('#c3-cursor');
let isTouch = ('ontouchstart' in window);

if (isTouch) {
  if (dot) dot.style.display = 'none';
  const s = document.createElement('style');
  s.textContent = '* { cursor: auto !important; }';
  document.head.appendChild(s);
} else {
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.chooser-card,.btn,.str-card,.invest-cta-primary,.invest-cta-secondary'))
      document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,.chooser-card,.btn,.str-card,.invest-cta-primary,.invest-cta-secondary'))
      document.body.classList.remove('cursor-hover');
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
}

// ── 2. PARTICLE CANVAS ──────────────────────────────────
const canvas = qs('#c3-particles');
if (canvas && !isTouch) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const BRASS = '196,120,58';
  const SLATE = '92,107,120';

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4 - .2;
      this.life = 0;
      this.maxLife = 180 + Math.random() * 120;
      this.r = 1 + Math.random() * 2;
      this.color = Math.random() > .6 ? BRASS : SLATE;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife) this.reset();
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * .5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger
    particles.push(p);
  }

  // Draw connection lines
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const alpha = (1 - dist/120) * .08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${BRASS},${alpha})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function animParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animParticles);
  }
  animParticles();
}

// ── 4. SCROLL PROGRESS ──────────────────────────────────
const progress = qs('#c3-progress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  if (progress) progress.style.width = pct + '%';
}, { passive: true });

// ── 5. FAB ───────────────────────────────────────────────
const fab = qs('#c3-fab');
window.addEventListener('scroll', () => {
  if (!fab) return;
  fab.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// ── 6. MARKET TICKER ────────────────────────────────────
const tickerData = [
  { label: 'YoY Price Growth',     value: '+10.5%' },
  { label: 'Annual Visitors',      value: '19M+' },
  { label: 'Fastest-Growing Metro',value: '#2 in US' },
  { label: 'Golf Courses',         value: '100+' },
  { label: 'Miles of Beach',       value: '60 miles' },
  { label: 'Inbound Migration #1', value: 'North Carolina' },
  { label: 'New Construction From',value: '$270K' },
  { label: 'BrickWood Mortgage',   value: 'NMLS #189497' },
];

const ticker    = qs('#c3-ticker');
const tickTrack = qs('#ticker-track');
if (ticker && tickTrack) {
  const doubled = [...tickerData, ...tickerData];
  tickTrack.innerHTML = doubled.map(d =>
    `<span class="ticker-item"><span class="ticker-sep">◆</span> ${d.label}: <strong>${d.value}</strong></span>`
  ).join('');
  ticker.style.display = 'block';
  const header = qs('header');
  if (header) header.after(ticker);
}

// ── 7. HERO WORD SPLIT ──────────────────────────────────
function splitWords() {
  const h1 = qs('.hero-h1');
  if (!h1 || h1.dataset.split) return;
  h1.dataset.split = '1';
  let wordIdx = 0;
  h1.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
        if (!w) return;
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        span.style.animationDelay = (wordIdx * 0.09) + 's';
        wordIdx++;
        frag.appendChild(span);
      });
      node.replaceWith(frag);
    } else if (node.nodeName === 'EM') {
      const txt = node.textContent.trim();
      node.textContent = '';
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = txt;
      span.style.animationDelay = (wordIdx * 0.09) + 's';
      wordIdx++;
      node.appendChild(span);
    }
  });
}
setTimeout(splitWords, 30);

// ── 8. SCRAMBLE TEXT ────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el, finalText, duration) {
  if (!el) return;
  let frame = 0;
  const totalFrames = Math.round(duration / 16);
  const orig = finalText || el.textContent;
  const interval = setInterval(() => {
    const progress = frame / totalFrames;
    el.textContent = orig.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i / orig.length < progress) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    frame++;
    if (frame > totalFrames) { el.textContent = orig; clearInterval(interval); }
  }, 16);
}

// ── 9. SCROLL REVEAL ────────────────────────────────────
function initReveal() {
  const map = [
    ['.why-stat',          'sr sr-scale sr-d'],
    ['.chooser-card',      'sr sr-flip sr-d'],
    ['.section-h2',        'sr sr-left'],
    ['.why-body',          'sr'],
    ['.segment-card',      'sr sr-scale sr-d'],
    ['.tool-card',         'sr sr-scale sr-d'],
    ['.accordion-item',    'sr sr-d'],
    ['.metric-card',       'sr sr-scale sr-d'],
    ['.mistake-row',       'sr sr-left'],
    ['.data-tiles-grid > div', 'sr sr-scale sr-d'],
    ['.vs-grid > div',     'sr sr-scale sr-d'],
    ['.states-grid > div', 'sr sr-scale sr-d'],
  ];

  map.forEach(([sel, cls]) => {
    qsa(sel).forEach((el, i) => {
      if (el.classList.contains('sr')) return;
      cls.split(' ').forEach(c => {
        if (c === 'sr-d') { el.classList.add('sr-d' + Math.min(i+1, 6)); }
        else el.classList.add(c);
      });
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Scramble eyebrows when they enter view
        const eyebrow = e.target.querySelector?.('.eyebrow');
        if (eyebrow) scramble(eyebrow, null, 500);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  qsa('.sr').forEach(el => obs.observe(el));

  // Dividers
  const divObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.5 });
  qsa('.c3-divider').forEach(el => divObs.observe(el));
}

// ── 10. COUNTER ANIMATION ───────────────────────────────
function countUp(el, end, suffix, dur) {
  if (!el) return;
  const start = performance.now();
  const isFloat = (end % 1 !== 0);
  el.classList.add('glow');
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1-p, 4);
    const val = end * ease;
    el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else { el.textContent = (isFloat ? end.toFixed(1) : end) + suffix; el.classList.remove('glow'); }
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const defs = [
    { sel: '.why-stats .why-stat:nth-child(1) .stat-kpi', end: 30, suf: '+',  dur: 1400 },
    { sel: '.why-stats .why-stat:nth-child(2) .stat-kpi', end: 8,  suf: '',   dur: 900  },
  ];
  defs.forEach(({ sel, end, suf, dur }) => {
    const el = qs(sel);
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { countUp(el, end, suf, dur); obs.disconnect(); }
    }, { threshold: 0.5 });
    const parent = el.closest('.why-stat');
    if (parent) obs.observe(parent);
  });
}

// ── 11. CARD TILT + GLOW ────────────────────────────────
function initTilt() {
  qsa('.chooser-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${x*12}deg) rotateX(${-y*10}deg) translateY(-10px) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.23,1,.32,1)';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
}

// ── 12. (removed) MAGNETIC BUTTONS ───────────────────────
// Buttons used to follow the cursor and lift on hover. Removed on owner
// instruction: a button that moves is harder to click, and it moves under
// the pointer on the way to it. Buttons now change colour only.

// ── 13. BUTTON RIPPLE ────────────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-brass,.btn-primary,.chooser-card');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(r.width, r.height) * 2;
  ripple.className = 'btn-ripple';
  ripple.style.cssText = `
    width:${size}px;height:${size}px;
    left:${e.clientX - r.left - size/2}px;
    top:${e.clientY - r.top - size/2}px;
  `;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ── 14. HERO ORBS ────────────────────────────────────────
function initOrbs() {
  const hero = qs('.bg-grid');
  if (!hero) return;
  const orbDefs = [
    { w: 500, h: 500, x: '70%', y: '-20%', color: 'rgba(196,120,58,.12)', dur: 12 },
    { w: 400, h: 400, x: '-10%', y: '60%', color: 'rgba(92,107,120,.1)',  dur: 16 },
    { w: 300, h: 300, x: '40%',  y: '80%', color: 'rgba(196,120,58,.07)', dur: 20 },
  ];
  orbDefs.forEach(({ w, h, x, y, color, dur }, i) => {
    const orb = document.createElement('div');
    orb.className = 'hero-orb';
    orb.style.cssText = `
      width:${w}px;height:${h}px;
      left:${x};top:${y};
      background:${color};
      animation-duration:${dur}s;
      animation-delay:${-i*3}s;
    `;
    // Custom float keyframes via JS
    const kf = document.createElement('style');
    const name = `orbF${i}`;
    const a1 = Math.random()*20-10, a2 = Math.random()*20-10;
    const b1 = Math.random()*20-10, b2 = Math.random()*20-10;
    kf.textContent = `@keyframes ${name}{0%{transform:translate(0,0)}33%{transform:translate(${a1}px,${a2}px)}66%{transform:translate(${b1}px,${b2}px)}100%{transform:translate(0,0)}}`;
    document.head.appendChild(kf);
    orb.style.animationName = name;
    orb.style.animationTimingFunction = 'ease-in-out';
    orb.style.animationIterationCount = 'infinite';
    hero.appendChild(orb);
  });
}

// ── 15. PAGE TRANSITION ──────────────────────────────────
const overlay = qs('#c3-transition');
const overlayLabel = qs('#c3-transition-label');
let transitioning = false;
const origShowPage = window.showPage;

window.showPage = function(id) { origShowPage(id); };

// ── 16. INJECTED DIVIDERS ───────────────────────────────
function injectDividers() {
  qsa('#path-chooser, #why-us, #cta').forEach(s => {
    if (s.previousElementSibling?.classList.contains('c3-divider')) return;
    const d = document.createElement('div');
    d.className = 'c3-divider';
    s.before(d);
  });
}

// ── 17. EYEBROW SCRAMBLE ON LOAD ─────────────────────────
function scrambleHeroEyebrow() {
  const el = qs('.hero-eyebrow');
  if (el) scramble(el, null, 800);
}

// ── INIT ─────────────────────────────────────────────────
function init() {
  initReveal();
  initCounters();
  initTilt();
  injectDividers();
  initOrbs();
  setTimeout(scrambleHeroEyebrow, 200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

// Re-init on dynamic content changes
new MutationObserver(() => {
  setTimeout(() => { initTilt(); }, 60);
}).observe(document.body, { childList: true, subtree: false });

})();
