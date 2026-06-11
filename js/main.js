// THEME TOGGLE (light / dark)
(function () {
  const root = document.documentElement;
  const icons = { dark: '🌙', light: '☀️' };
  const stored = localStorage.getItem('htmart-theme');
  const initial = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    document.querySelectorAll('.theme-toggle .theme-icon').forEach(el => {
      el.textContent = icons[theme];
    });
  }

  applyTheme(initial);

  function toggleTheme() {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('htmart-theme', next);
  }

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
})();

// CUSTOM CURSOR
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && cur && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
  });
  function animRing() {
    rx += (mx - rx) * .1;
    ry += (my - ry) * .1;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.addEventListener('mouseover', e => {
    const fieldEl = e.target.closest('input,textarea,select,label');
    if (fieldEl) {
      cur.classList.add('hidden');
      ring.classList.add('hidden');
      return;
    }
    cur.classList.remove('hidden');
    ring.classList.remove('hidden');

    if (e.target.closest('a,button,.svc-card,.port-card,.port-item,.val-card,.team-card,.testi-card,.play-btn,.port-play')) {
      cur.classList.add('hovered');
      ring.classList.add('hovered');
    } else {
      cur.classList.remove('hovered');
      ring.classList.remove('hovered');
    }
  });
}

// NAVIGATION
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(initReveal, 50);
}

// MOBILE NAV
function openMobileNav() { document.getElementById('mobileNav').classList.add('open'); }
function closeMobileNav() { document.getElementById('mobileNav').classList.remove('open'); }

// SCROLL NAV SHADOW
window.addEventListener('scroll', () => document.getElementById('mainNav').classList.toggle('scrolled', scrollY > 20));

// SCROLL REVEAL
function initReveal() {
  const els = document.querySelectorAll('.page.active .reveal:not(.visible)');
  if (reduceMotion) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}
initReveal();

// PORTFOLIO FILTERS (UI only)
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// CONTACT FORM SUBMIT
function submitForm(btn) {
  btn.textContent = '✓ Message Sent! We\'ll be in touch soon.';
  btn.classList.add('success');
  setTimeout(() => {
    btn.textContent = 'Send Message ✦';
    btn.classList.remove('success');
  }, 4000);
}

// PREVENT DEFAULT on placeholder links
document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
