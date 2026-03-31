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

})();
