/* ════════════════════════════════════════════════════════
   ILHAN ESMAIL — PORTFOLIO SCRIPTS
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const navbar   = document.getElementById('navbar');
  const navMenu  = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelectorAll('.navbar__link');
  const sections = document.querySelectorAll('section[id]');

  /* ── 1. NAVBAR SCROLL BACKGROUND ───────────────────── */
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── 2. ACTIVE NAV LINK (IntersectionObserver) ──────── */
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.remove('navbar__link--active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('navbar__link--active');
          }
        });
      }
    });
  }, {
    rootMargin: '-45% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ── 3. HAMBURGER MENU TOGGLE ───────────────────────── */
  navToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('navbar__nav--open');
    navToggle.classList.toggle('navbar__toggle--open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a nav link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('navbar__nav--open');
      navToggle.classList.remove('navbar__toggle--open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('navbar__nav--open')) {
      navMenu.classList.remove('navbar__nav--open');
      navToggle.classList.remove('navbar__toggle--open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });

  /* ── 4. SMOOTH SCROLL (offset for sticky navbar) ───── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var navH = navbar.offsetHeight;
      var top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── 5. FADE-IN ON SCROLL (IntersectionObserver) ───── */
  var fadeEls = document.querySelectorAll('.fade-in');

  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08
  });

  fadeEls.forEach(function (el) {
    fadeObserver.observe(el);
  });

  // Make hero elements immediately visible if at top of page
  if (window.scrollY < 100) {
    var heroEls = document.querySelectorAll('.section--hero .fade-in');
    heroEls.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('is-visible');
      }, i * 120);
    });
  }

  /* ── 6. HEXAGONAL CANVAS ANIMATION ─────────────────── */
  (function () {
    var canvas = document.getElementById('hexCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var hexes = [];
    var animId;

    // Hex geometry — flat-top orientation
    var R = 32;                      // circumradius
    var W = R * Math.sqrt(3);        // hex width  (flat-top)
    var H = R * 2;                   // hex height

    // Accent colour — read from CSS custom property
    function accentRGB() {
      // --accent is e.g. "#ed7b58" → parse to r,g,b
      var hex = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim().replace('#', '');
      var r = parseInt(hex.slice(0,2), 16);
      var g = parseInt(hex.slice(2,4), 16);
      var b = parseInt(hex.slice(4,6), 16);
      return r + ',' + g + ',' + b;
    }

    var RGB = accentRGB();

    // Draw a single flat-top hexagon (stroke only)
    function drawHex(cx, cy, r, alpha) {
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var angle = (Math.PI / 3) * i; // flat-top: start at 0°
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(' + RGB + ',' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Occasionally fill with a very faint glow on bright hexes
      if (alpha > 0.14) {
        ctx.fillStyle = 'rgba(' + RGB + ',' + (alpha * 0.12).toFixed(3) + ')';
        ctx.fill();
      }
    }

    // Build the grid of hex descriptors
    function buildGrid() {
      hexes = [];
      var cols = Math.ceil(canvas.width  / W) + 3;
      var rows = Math.ceil(canvas.height / (H * 0.75)) + 3;

      for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
          // Offset every other row (axial offset grid)
          var cx = col * W + (row % 2) * (W / 2) - W;
          var cy = row * H * 0.75 - H;

          // Each cell gets an independent slow oscillator
          hexes.push({
            cx: cx,
            cy: cy,
            phase:    Math.random() * Math.PI * 2,
            // Cells nearer the right side of canvas start slightly brighter
            // to create a natural rightward gradient (towards the photo)
            bias:     0.02 + (cx / (canvas.width || 1)) * 0.04,
            speed:    0.004 + Math.random() * 0.006,
            amp:      0.04  + Math.random() * 0.08
          });
        }
      }
    }

    // Resize canvas to match its CSS size
    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      buildGrid();
    }

    var tick = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      for (var i = 0; i < hexes.length; i++) {
        var h = hexes[i];
        h.phase += h.speed;

        // Base alpha: slow sine wave + a slower global "breath"
        var breath = Math.sin(tick * 0.005) * 0.02;
        var alpha  = h.bias + h.amp * (0.5 + 0.5 * Math.sin(h.phase)) + breath;
        alpha = Math.max(0, Math.min(alpha, 0.28));

        drawHex(h.cx, h.cy, R - 2, alpha);
      }

      animId = requestAnimationFrame(animate);
    }

    // Pause animation when hero is off-screen (performance)
    var heroSection = document.getElementById('hero');
    if (heroSection && typeof IntersectionObserver !== 'undefined') {
      var heroIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!animId) animate();
          } else {
            cancelAnimationFrame(animId);
            animId = null;
          }
        });
      }, { threshold: 0 });
      heroIO.observe(heroSection);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animId);
        animId = null;
        resize();
        animate();
      }, 120);
    }, { passive: true });

    resize();
    animate();
  }());

})();
