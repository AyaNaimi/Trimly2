(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initNav();
    initMobileNav();
    initHeroLines();
    initReveal();
    initSmoothScroll();
    initGsap();
  });

  function initNav() {
    var nav = document.getElementById('nav');
    var lastY = 0;
    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            var y = window.scrollY;
            nav.classList.toggle('nav--scrolled', y > 20);
            if (y > 100 && y > lastY + 5) nav.classList.add('nav--hidden');
            else if (y < lastY - 5 || y < 60) nav.classList.remove('nav--hidden');
            lastY = y;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('nav__links--open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHeroLines() {
    var lines = document.querySelectorAll('[data-hero-line]');
    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add('is-in');
      }, 120 + i * 140);
    });
  }

  function initReveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var delay = Number(entry.target.getAttribute('data-reveal-delay') || 0);
          setTimeout(function () {
            entry.target.classList.add('is-revealed');
          }, delay);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 80;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - navH,
          behavior: 'smooth',
        });
      });
    });
  }

  function initGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var portrait = document.querySelector('.hero__portrait');
    if (portrait) {
      gsap.to(portrait, {
        y: 60,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    gsap.utils.toArray('.status-card').forEach(function (card, i) {
      gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 92%' },
      });
    });
  }
})();
