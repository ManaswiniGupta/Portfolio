/**
 * Alex Chen — AI Engineer Portfolio
 * script.js — Interactions, Animations & Canvas
 */

/* ─────────────────────────────────────────────
   1. LOADER
───────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Start reveal animations after load
    observeRevealElements();
    animateHeroStats();
  }, 900);
});

document.body.style.overflow = 'hidden';

/* ─────────────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

if (cursor && cursorTrail) {
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth trail via RAF
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Expand on interactive elements
  const interactables = 'a, button, .skill-tag, .project-card, .channel-link, .about-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactables)) {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.2)';
      cursorTrail.style.transform = 'translate(-50%, -50%) scale(1.4)';
    } else {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorTrail.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });
}

/* ─────────────────────────────────────────────
   3. NAVBAR SCROLL BEHAVIOUR + ACTIVE SECTION
───────────────────────────────────────────── */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

window.addEventListener('scroll', () => {
  // Scroll class
  nav.classList.toggle('scrolled', window.scrollY > 30);

  // Active section highlight
  let current = '';
  document.querySelectorAll('section[id]').forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= 100) current = section.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
});

/* ─────────────────────────────────────────────
   4. MOBILE MENU
───────────────────────────────────────────── */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  // Animate hamburger → X
  const spans = navToggle.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
    spans[1].style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  });
});

/* ─────────────────────────────────────────────
   5. SCROLL-TRIGGERED REVEAL (Intersection Observer)
───────────────────────────────────────────── */
function observeRevealElements() {
  const elements = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   6. ANIMATED COUNTERS
───────────────────────────────────────────── */
function animateCount(el, target, duration = 1400) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

// Observe stat sections
function setupCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count, 10);
        animateCount(entry.target, target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}
setupCounters();

/* Hero stat counters (triggered after loader) */
function animateHeroStats() {
  document.querySelectorAll('.hstat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    setTimeout(() => animateCount(el, target, 1200), 300);
  });
}

/* ─────────────────────────────────────────────
   7. NEURAL NETWORK CANVAS (Hero Background)
───────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes = [], animId;
  const NODE_COUNT = 60;
  const CONNECTION_DIST = 160;
  const CYAN   = '0, 212, 255';
  const VIOLET = '139, 92, 246';

  class Node {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.5 + 0.5;
      this.color = Math.random() > 0.5 ? CYAN : VIOLET;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.02;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }

    draw() {
      const alpha = 0.4 + Math.sin(this.pulse) * 0.25;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${nodes[i].color}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => { n.update(); n.draw(); });
    drawConnections();
    animId = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, () => new Node());
    if (animId) cancelAnimationFrame(animId);
    tick();
  }

  window.addEventListener('resize', () => { resize(); });
  init();

  // Subtle mouse parallax on nodes
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.3;
    my = (e.clientY / window.innerHeight - 0.5) * 0.3;
    nodes.forEach(n => {
      n.vx += mx * 0.002;
      n.vy += my * 0.002;
      // Clamp speed
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > 0.8) { n.vx *= 0.8 / speed; n.vy *= 0.8 / speed; }
    });
  });
})();

/* ─────────────────────────────────────────────
   8. PARALLAX ON HERO ORBS
───────────────────────────────────────────── */
document.addEventListener('mousemove', (e) => {
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  if (!orb1 || !orb2) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  orb1.style.transform = `translate(${x}px, ${y}px)`;
  orb2.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px)`;
});

/* ─────────────────────────────────────────────
   9. SMOOTH SCROLL FOR NAV LINKS
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─────────────────────────────────────────────
   10. CONTACT FORM → open mailto
───────────────────────────────────────────── */
const formSubmit = document.getElementById('formSubmit');
if (formSubmit) {
  formSubmit.addEventListener('click', () => {
    const name    = document.querySelector('.form-input[type="text"]')?.value  || '';
    const email   = document.querySelector('.form-input[type="email"]')?.value || '';
    const message = document.querySelector('.form-textarea')?.value             || '';

    if (!message.trim()) {
      shakeEl(formSubmit);
      return;
    }

    const subject = encodeURIComponent(`Portfolio Contact from ${name || 'visitor'}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    // Replace with your actual email
    window.open(`mailto:alex@example.com?subject=${subject}&body=${body}`);
  });
}

function shakeEl(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.35s ease';
  setTimeout(() => el.style.animation = '', 400);
}

/* Inject shake keyframe */
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}`;
document.head.appendChild(style);

/* ─────────────────────────────────────────────
   11. TYPING ANIMATION on hero subtitle
───────────────────────────────────────────── */
(function typewriterEffect() {
  const phrases = [
    'LLM Systems Architect.',
    'Agent Framework Builder.',
    'Fine-tuning Specialist.',
    'Inference Infrastructure.',
  ];
  const target = document.querySelector('.hero-sub');
  if (!target) return;

  const originalText = target.textContent.trim();
  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;
  let paused      = false;

  // Wrap animated part in a span
  target.innerHTML = originalText + ' <span id="typer" style="display:inline-block;min-width:0"></span><span class="typer-cursor" style="color:var(--cyan);animation:blink 0.9s infinite">|</span>';

  const typerEl = document.getElementById('typer');

  const blinkStyle = document.createElement('style');
  blinkStyle.textContent = `@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`;
  document.head.appendChild(blinkStyle);

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting && !paused) {
      typerEl.textContent = phrase.slice(0, ++charIndex);
      if (charIndex === phrase.length) {
        paused = true;
        setTimeout(() => { paused = false; deleting = true; }, 2200);
      }
    } else if (deleting && !paused) {
      typerEl.textContent = phrase.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    const delay = deleting ? 40 : paused ? 100 : 70;
    setTimeout(tick, delay);
  }

  // Start after loader
  setTimeout(tick, 1500);
})();

/* ─────────────────────────────────────────────
   12. SCROLL PROGRESS INDICATOR (top of page)
───────────────────────────────────────────── */
(function scrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 9999;
    height: 2px; width: 0%;
    background: linear-gradient(90deg, #00D4FF, #8B5CF6);
    transition: width 0.05s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = Math.min(100, (scrolled / total) * 100) + '%';
  });
})();

/* ─────────────────────────────────────────────
   13. PROJECT CARD — subtle 3D tilt on hover
───────────────────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s var(--ease-out-expo)';
    setTimeout(() => card.style.transition = '', 500);
  });
});

/* ─────────────────────────────────────────────
   14. SKILL TAGS — stagger reveal inside skill categories
───────────────────────────────────────────── */
(function skillTagReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag');
        tags.forEach((tag, i) => {
          tag.style.opacity    = '0';
          tag.style.transform  = 'translateY(8px)';
          tag.style.transition = `opacity 0.4s ${i * 50}ms, transform 0.4s ${i * 50}ms`;
          setTimeout(() => {
            tag.style.opacity   = '1';
            tag.style.transform = 'translateY(0)';
          }, 50);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-category').forEach(cat => obs.observe(cat));
})();

/* ─────────────────────────────────────────────
   15. INTERSECTION OBSERVER — timeline items
───────────────────────────────────────────── */
(function timelineReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(-20px)';
    item.style.transition = `opacity 0.6s ${i * 120}ms var(--ease-out-expo), transform 0.6s ${i * 120}ms var(--ease-out-expo)`;
    obs.observe(item);
  });
})();
