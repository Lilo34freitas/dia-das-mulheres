/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   WOMEN'S DAY SPA — app.js                              ║
 * ║   Redesign: Botões de seleção + Slide Transitions        ║
 * ║             + Página Amiga com textos animados           ║
 * ╚══════════════════════════════════════════════════════════╝
 */

'use strict';

/* ════════════════════════════════════════════════
   §0  SPLASH SCREEN — animação de abertura
════════════════════════════════════════════════ */
const SplashScreen = (() => {
  let splashEl, heartWrap, particleCanvas, particleCtx;
  let animFrame, particles = [];
  let done = false;

  function spawnParticle(w, h) {
    const colors = ['#e8527a', '#c084fc', '#f4789a', '#9b59f5', '#f0a34e', '#ff7eb3'];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6 - 0.3,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      decay: Math.random() * 0.004 + 0.003,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.06 + 0.02
    };
  }

  function initParticles() {
    const w = particleCanvas.width = window.innerWidth;
    const h = particleCanvas.height = window.innerHeight;
    for (let i = 0; i < 120; i++) particles.push(spawnParticle(w, h));
  }

  function drawParticles() {
    const w = particleCanvas.width, h = particleCanvas.height;
    particleCtx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.alpha -= p.decay;
      p.twinkle += p.twinkleSpeed;
      const a = p.alpha * (0.5 + 0.5 * Math.sin(p.twinkle));
      if (p.alpha <= 0) {
        particles[i] = spawnParticle(w, h);
        particles[i].alpha = Math.random() * 0.4 + 0.1;
        continue;
      }
      particleCtx.save();
      particleCtx.globalAlpha = Math.max(0, a);
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      particleCtx.fillStyle = p.color;
      particleCtx.shadowBlur = 8;
      particleCtx.shadowColor = p.color;
      particleCtx.fill();
      particleCtx.restore();
    }
  }

  function dismiss() {
    if (done) return;
    done = true;
    cancelAnimationFrame(animFrame);
    splashEl.classList.add('exit');
    setTimeout(() => { splashEl.style.display = 'none'; }, 950);
  }

  function runSequence() {
    setTimeout(() => { heartWrap.classList.add('spinning'); }, 300);

    setTimeout(() => {
      heartWrap.classList.remove('spinning');
      heartWrap.classList.add('resting');
    }, 2750);

    setTimeout(() => {
      heartWrap.classList.remove('resting');
      heartWrap.classList.add('rising');
    }, 3100);

    setTimeout(() => {
      heartWrap.classList.remove('rising');
      heartWrap.classList.add('above-text');

      const textEl = document.getElementById('splash-text');
      textEl.classList.add('visible');

      const l1 = document.getElementById('splash-line1');
      const l2 = document.getElementById('splash-line2');
      const sub = document.getElementById('splash-sub');
      setTimeout(() => l1.classList.add('reveal'), 60);
      setTimeout(() => l2.classList.add('reveal'), 280);
      setTimeout(() => sub.classList.add('show'), 900);
    }, 3800);
  }

  function init() {
    splashEl = document.getElementById('splash-screen');
    heartWrap = document.getElementById('splash-heart-wrap');
    particleCanvas = document.getElementById('splash-particles');
    particleCtx = particleCanvas.getContext('2d');

    initParticles();

    const skipBtn = document.getElementById('splash-skip');
    skipBtn.addEventListener('click', dismiss);
    skipBtn.addEventListener('keydown', e => e.key === 'Enter' && dismiss());
    splashEl.addEventListener('click', dismiss);

    function loop() {
      if (done) return;
      drawParticles();
      animFrame = requestAnimationFrame(loop);
    }
    loop();
    runSequence();
  }

  return { init };
})();


/* ════════════════════════════════════════════════
   §1  UTILITIES
════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b)); }
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function hsl(h, s, l, a = 1) { return `hsla(${h},${s}%,${l}%,${a})`; }

/** Unified pointer (mouse + touch) */
const Pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  dx: 0, dy: 0,
  prevX: 0, prevY: 0,
  down: false,
  _update(x, y) {
    this.dx = x - this.prevX;
    this.dy = y - this.prevY;
    this.prevX = this.x; this.prevY = this.y;
    this.x = x; this.y = y;
  }
};

(function bindPointer() {
  const upd = (x, y) => Pointer._update(x, y);
  window.addEventListener('mousemove', e => upd(e.clientX, e.clientY));
  window.addEventListener('mousedown', () => Pointer.down = true);
  window.addEventListener('mouseup', () => Pointer.down = false);
  window.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0]; upd(t.clientX, t.clientY);
  }, { passive: false });
  window.addEventListener('touchstart', e => {
    Pointer.down = true;
    const t = e.touches[0]; upd(t.clientX, t.clientY);
  });
  window.addEventListener('touchend', () => Pointer.down = false);
})();


/* ════════════════════════════════════════════════
   §2  PARTICLE CLASS
════════════════════════════════════════════════ */
class Particle {
  constructor({ x, y, vx = 0, vy = 0, radius = 3, color = '#fff',
    alpha = 1, life = 1, decay = 0.015, friction = 0.96, mass = 1 }) {
    Object.assign(this, {
      x, y, vx, vy, radius, color, alpha, life,
      maxLife: life, decay, friction, mass, dead: false
    });
  }
  applyForce(fx, fy) { this.vx += fx / this.mass; this.vy += fy / this.mass; }
  update() {
    this.vx *= this.friction; this.vy *= this.friction;
    this.x += this.vx; this.y += this.vy;
    this.life -= this.decay;
    this.alpha = clamp(this.life / this.maxLife, 0, 1);
    if (this.life <= 0) this.dead = true;
  }
  draw(ctx) {
    if (this.dead) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.1, this.radius * this.alpha), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  drawGlow(ctx, glowColor) {
    if (this.dead) return;
    const r = Math.max(0.1, this.radius * this.alpha);
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.5;
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 3);
    g.addColorStop(0, glowColor || this.color);
    g.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}


/* ════════════════════════════════════════════════
   §3  PHYSICS HELPERS
════════════════════════════════════════════════ */
const Physics = {
  attract(p, tx, ty, strength = 0.05) {
    const dx = tx - p.x, dy = ty - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = strength / dist;
    p.applyForce(dx * f, dy * f);
  },
  repelFromPoint(p, ox, oy, minDist = 60, strength = 0.8) {
    const dx = p.x - ox, dy = p.y - oy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist < minDist) {
      const f = (minDist - dist) / minDist * strength;
      p.applyForce(dx / dist * f, dy / dist * f);
    }
  },
  applyGravity(p, gx = 0, gy = 0.1) { p.applyForce(gx, gy); }
};


/* ════════════════════════════════════════════════
   §4  CANVAS MANAGER
════════════════════════════════════════════════ */
class CanvasManager {
  constructor(id) {
    this.canvas = $(id);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }
  get w() { return this.canvas.width; }
  get h() { return this.canvas.height; }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  clear(alpha = 0) {
    if (alpha === 0) {
      this.ctx.clearRect(0, 0, this.w, this.h);
    } else {
      this.ctx.fillStyle = `rgba(6,4,15,${alpha})`;
      this.ctx.fillRect(0, 0, this.w, this.h);
    }
  }
}


/* ════════════════════════════════════════════════
   §5  STATE MACHINE — Slide Transition
════════════════════════════════════════════════ */
const STATE = { PORTAL: 'PORTAL', MAE: 'MAE', AMIGA: 'AMIGA' };
let currentState = STATE.PORTAL;
let transitioning = false;

/**
 * Executes a vertical slide transition between phases.
 * direction: 'up' means current slides up (to MÃE), 'down' means slides down (to AMIGA)
 */
function slideTransition(next, direction) {
  if (transitioning) return;
  transitioning = true;

  const currentEl = getCurrentSectionEl();
  const nextEl = getNextSectionEl(next);

  // 1. Position nextEl off-screen in the incoming direction
  const enterFrom = direction === 'up' ? 'slide-enter-from-below' : 'slide-enter-from-above';
  nextEl.classList.add(enterFrom);

  // Force reflow so initial position is painted before transition starts
  void nextEl.offsetHeight;

  // 2. Make nextEl visible (opacity 0, off-screen)
  nextEl.classList.remove('slide-enter-from-below', 'slide-enter-from-above');
  nextEl.style.transition = 'none';
  nextEl.style.opacity = '0';
  nextEl.style.transform = direction === 'up' ? 'translateY(100vh)' : 'translateY(-100vh)';
  void nextEl.offsetHeight;
  nextEl.style.transition = '';

  // 3. Slide out current, slide in next
  const exitClass = direction === 'up' ? 'slide-exit-up' : 'slide-exit-down';
  currentEl.classList.add(exitClass);

  requestAnimationFrame(() => {
    nextEl.style.opacity = '1';
    nextEl.style.transform = 'translateY(0)';
    nextEl.style.pointerEvents = 'none';

    setTimeout(() => {
      // Clean up
      currentEl.classList.remove('active', exitClass);
      currentEl.style.transform = '';
      currentEl.style.opacity = '';
      nextEl.style.transform = '';
      nextEl.style.opacity = '';
      nextEl.style.transition = '';
      nextEl.style.pointerEvents = '';
      nextEl.classList.add('active');

      currentState = next;
      transitioning = false;

      if (next === STATE.MAE) StorySection.enter('mae');
      if (next === STATE.AMIGA) StorySection.enter('amiga');
    }, 750);
  });
}

function getCurrentSectionEl() {
  if (currentState === STATE.PORTAL) return $('portal');
  if (currentState === STATE.MAE) return $('section-mae');
  return $('section-amiga');
}

function getNextSectionEl(next) {
  if (next === STATE.MAE) return $('section-mae');
  if (next === STATE.AMIGA) return $('section-amiga');
  return $('portal');
}

function backToPortal() {
  if (transitioning) return;
  const direction = currentState === STATE.MAE ? 'down' : 'up';

  if (currentState === STATE.MAE) StorySection.exit('mae');
  if (currentState === STATE.AMIGA) StorySection.exit('amiga');

  const currentEl = getCurrentSectionEl();
  const portalEl = $('portal');

  // Position portal off-screen
  portalEl.style.transition = 'none';
  portalEl.style.opacity = '0';
  portalEl.style.transform = direction === 'down' ? 'translateY(-100vh)' : 'translateY(100vh)';
  void portalEl.offsetHeight;
  portalEl.style.transition = '';

  const exitClass = direction === 'down' ? 'slide-exit-down' : 'slide-exit-up';
  transitioning = true;
  currentEl.classList.add(exitClass);

  requestAnimationFrame(() => {
    portalEl.style.opacity = '1';
    portalEl.style.transform = 'translateY(0)';
    portalEl.style.pointerEvents = 'none';

    setTimeout(() => {
      currentEl.classList.remove('active', exitClass);
      currentEl.style.transform = '';
      currentEl.style.opacity = '';
      portalEl.style.transform = '';
      portalEl.style.opacity = '';
      portalEl.style.transition = '';
      portalEl.style.pointerEvents = '';
      portalEl.classList.add('active');
      currentState = STATE.PORTAL;
      transitioning = false;
    }, 750);
  });
}



/* ════════════════════════════════════════════════
   §7  PORTAL STAR BACKGROUND
════════════════════════════════════════════════ */
const PortalBg = (() => {
  let cm, ctx, stars = [], t = 0;

  function init() {
    cm = new CanvasManager('portal-bg-canvas');
    ctx = cm.ctx;
    stars = Array.from({ length: 100 }, () => ({
      x: rand(0, cm.w), y: rand(0, cm.h),
      r: rand(0.5, 2.2), alpha: rand(0.1, 0.7),
      drift: rand(-0.06, 0.06), twinkle: rand(0, Math.PI * 2)
    }));
  }

  function update() {
    if (currentState !== STATE.PORTAL) return;
    t += 0.016;
    ctx.clearRect(0, 0, cm.w, cm.h);
    for (const s of stars) {
      s.y += s.drift;
      s.twinkle += 0.04;
      if (s.y < 0) s.y = cm.h;
      if (s.y > cm.h) s.y = 0;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#c084fc';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return { init, update };
})();


/* ════════════════════════════════════════════════
   §8  TRANSITION BURST EFFECT
════════════════════════════════════════════════ */
const TransitionEffect = (() => {
  let cm, particles = [];
  const MAE_COLS = ['#e8527a', '#9b59f5', '#f4789a', '#c084fc', '#f0a34e'];
  const AMIGA_COLS = ['#38d9c0', '#22c4f0', '#5c6ef5', '#6ef0db', '#a7f3d0'];

  function init() { cm = new CanvasManager('transition-canvas'); }

  function burst(x, y, theme) {
    const cols = theme === 'mae' ? MAE_COLS : AMIGA_COLS;
    cm.canvas.style.zIndex = '950';
    for (let i = 0; i < 160; i++) {
      const angle = rand(0, Math.PI * 2), speed = rand(3, 14);
      particles.push(new Particle({
        x: x + rand(-10, 10), y: y + rand(-10, 10),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        radius: rand(2, 7), color: randChoice(cols),
        life: rand(0.5, 1.2), decay: rand(0.015, 0.03), friction: 0.93
      }));
    }
    setTimeout(() => { particles = []; cm.clear(0); cm.canvas.style.zIndex = '-1'; }, 900);
  }

  function update() {
    if (particles.length === 0) return;
    cm.clear(0);
    particles = particles.filter(p => !p.dead);
    particles.forEach(p => { p.update(); p.drawGlow(cm.ctx); });
  }

  return { init, burst, update };
})();


/* ════════════════════════════════════════════════
   §9  STORY SECTION (Mãe e Amiga) — Intersection Observer
════════════════════════════════════════════════ */
const StorySection = (() => {
  const observers = {};

  function updateDots(type, idx) {
    document.querySelectorAll(`#${type}-slide-dots .dot`).forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function applyWordDelays(type) {
    document.querySelectorAll(`#${type}-slides .story-word`).forEach(word => {
      const delay = parseInt(word.dataset.delay || 0, 10);
      word.style.transitionDelay = `${delay}ms`;
    });
  }

  function enter(type) { // 'mae' or 'amiga'
    applyWordDelays(type);

    // Scroll the slides container to top
    const slidesEl = $(`${type}-slides`);
    if (slidesEl) slidesEl.scrollTop = 0;

    // Show scroll hint
    const hint = $(`${type}-scroll-hint`);
    setTimeout(() => {
      if (hint) hint.classList.add('visible');
    }, 1200);

    // IntersectionObserver to trigger word animations per slide
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          const idx = parseInt(entry.target.dataset.index, 10);
          if (!isNaN(idx)) {
            updateDots(type, idx);
            if (idx > 0 && hint) hint.classList.remove('visible'); // hide hint after slide 1
          }
        } else {
          entry.target.classList.remove('in-view');
          entry.target.querySelectorAll('.story-word').forEach(w => {
            w.style.transitionDelay = '0ms';
          });
          setTimeout(() => {
            entry.target.querySelectorAll('.story-word').forEach(w => {
              const delay = parseInt(w.dataset.delay || 0, 10);
              w.style.transitionDelay = `${delay}ms`;
            });
          }, 50);
        }
      });
    }, { threshold: 0.55, root: slidesEl });

    observers[type] = observer;

    document.querySelectorAll(`#${type}-slides .story-slide`).forEach(slide => {
      observer.observe(slide);
    });

    // Sub-function to handle dot clicking just for this section
    document.querySelectorAll(`#${type}-slide-dots .dot`).forEach((dot, i) => {
      // remove old first to prevent double listeners if entering multiple times
      const freshDot = dot.cloneNode(true);
      dot.parentNode.replaceChild(freshDot, dot);
      freshDot.addEventListener('click', () => {
        const slide = document.getElementById(`${type}-slide-${i + 1}`);
        if (slide) slide.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Trigger first slide artificially
    setTimeout(() => {
      const firstSlide = document.getElementById(`${type}-slide-1`);
      if (firstSlide) firstSlide.classList.add('in-view');
      updateDots(type, 0);
    }, 200);
  }

  function exit(type) {
    if (observers[type]) {
      observers[type].disconnect();
      delete observers[type];
    }
    document.querySelectorAll(`#${type}-slides .story-slide`).forEach(s => s.classList.remove('in-view'));
    const hint = $(`${type}-scroll-hint`);
    if (hint) hint.classList.remove('visible');
    updateDots(type, 0);
  }

  return { enter, exit };
})();


/* ════════════════════════════════════════════════
   §12  PORTAL BUTTON EVENTS
════════════════════════════════════════════════ */
function initPortalButtons() {
  const btnMae = $('btn-mae');
  const btnAmiga = $('btn-amiga');

  btnMae.addEventListener('click', () => {
    if (transitioning || currentState !== STATE.PORTAL) return;
    // Small burst effect at click origin
    const r = btnMae.getBoundingClientRect();
    TransitionEffect.burst(r.left + r.width / 2, r.top + r.height / 2, 'mae');
    slideTransition(STATE.MAE, 'up');
  });

  btnAmiga.addEventListener('click', () => {
    if (transitioning || currentState !== STATE.PORTAL) return;
    const r = btnAmiga.getBoundingClientRect();
    TransitionEffect.burst(r.left + r.width / 2, r.top + r.height / 2, 'amiga');
    slideTransition(STATE.AMIGA, 'down');
  });

  // Keyboard
  btnMae.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btnMae.click();
    }
  });
  btnAmiga.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btnAmiga.click();
    }
  });
}

function initBackButtons() {
  $('back-from-mae').addEventListener('click', backToPortal);
  $('back-from-amiga').addEventListener('click', backToPortal);
}


/* ════════════════════════════════════════════════
   §13  MAIN LOOP
════════════════════════════════════════════════ */
function loop() {
  PortalBg.update();
  TransitionEffect.update();
  requestAnimationFrame(loop);
}


/* ════════════════════════════════════════════════
   §14  INIT
════════════════════════════════════════════════ */
function init() {
  SplashScreen.init();
  TransitionEffect.init();
  PortalBg.init();
  initPortalButtons();
  initBackButtons();

  // Resize handling
  window.addEventListener('resize', () => {
    document.querySelectorAll('canvas').forEach(c => {
      if (c.id === 'zoom-photo-canvas') return;
      const cm = c._cm;
      if (cm) cm.resize();
    });
  });

  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
