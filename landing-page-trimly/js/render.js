(function () {
  'use strict';

  const site = window.SITE_CONFIG;
  const theme = window.THEME_CONFIG;
  if (!site || !theme) return;

  const colorMap = theme.colors;

  function applyTheme() {
    const r = document.documentElement;
    const c = theme.colors;
    Object.keys(c).forEach(function (key) {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      r.style.setProperty('--color-' + cssKey, c[key]);
    });
    r.style.setProperty('--font-display', theme.fonts.display);
    r.style.setProperty('--font-body', theme.fonts.body);
    r.style.setProperty('--font-body-medium', theme.fonts.bodyMedium);
    r.style.setProperty('--max-width', theme.layout.maxWidth);
    r.style.setProperty('--nav-height', theme.layout.navHeight);
  }

  function setMeta() {
    document.title = site.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', site.meta.description);
  }

  function colorClass(name) {
    return 'tone--' + name;
  }

  function renderNav() {
    document.getElementById('nav-brand').textContent = site.brand.name;
    const linksRoot = document.getElementById('nav-links');
    linksRoot.innerHTML = '';
    site.nav.links.forEach(function (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.label;
      linksRoot.appendChild(a);
    });
    const cta = document.getElementById('nav-cta');
    cta.textContent = site.nav.cta.label;
    cta.href = site.nav.cta.href;
  }

  function renderHero() {
    const root = document.getElementById('hero-lines');
    root.innerHTML = '';
    site.hero.lines.forEach(function (line, i) {
      const row = document.createElement('h1');
      row.className = 'hero__line';
      row.setAttribute('data-hero-line', String(i));
      row.innerHTML =
        '<span class="hero__lead">' +
        line.lead +
        '</span> <em class="hero__word ' +
        colorClass(line.color) +
        '">' +
        line.highlight +
        '</em>' +
        (line.trail
          ? ' <span class="hero__trail">' + line.trail + '</span>'
          : '');
      root.appendChild(row);
    });
    const img = document.getElementById('hero-portrait');
    img.src = site.hero.portrait;
    img.alt = site.hero.portraitAlt;
  }

  function renderTicker() {
    const items = site.ticker.concat(site.ticker);
    document.getElementById('ticker-track').innerHTML = items
      .map(function (t) {
        return '<span class="ticker__item">' + t + '</span>';
      })
      .join('');
  }

  function renderStatus() {
    const grid = document.getElementById('status-grid');
    grid.innerHTML = '';
    site.statusCards.forEach(function (card, i) {
      const el = document.createElement('article');
      el.className = 'status-card ' + colorClass(card.color);
      el.setAttribute('data-reveal', '');
      el.setAttribute('data-reveal-delay', String(60 * i));
      el.innerHTML = '<h2>' + card.title + '</h2>';
      grid.appendChild(el);
    });
  }

  function renderAbout() {
    document.getElementById('about-role').textContent = site.about.role;
    document.getElementById('about-company').textContent = site.about.company;
    document.getElementById('about-prev-label').textContent = site.about.previousLabel;
    document.getElementById('about-bio').textContent = site.about.bio;
    const cta = document.getElementById('about-cta');
    cta.textContent = site.about.cta.label;
    cta.href = site.about.cta.href;
    const prev = document.getElementById('about-prev');
    prev.innerHTML = site.about.previous
      .map(function (name) {
        return '<li>' + name + '</li>';
      })
      .join('');
  }

  function renderServices() {
    document.getElementById('services-title').textContent = site.services.title;
    const grid = document.getElementById('services-grid');
    grid.innerHTML = '';
    site.services.items.forEach(function (item, i) {
      const el = document.createElement('article');
      el.className = 'service-card ' + colorClass(item.color);
      el.setAttribute('data-reveal', '');
      el.setAttribute('data-reveal-delay', String(80 * i));
      el.innerHTML = '<h3>' + item.title + '</h3>';
      grid.appendChild(el);
    });
  }

  function renderWork() {
    document.getElementById('work-title').textContent = site.work.title;
    const grid = document.getElementById('work-grid');
    grid.innerHTML = '';
    site.work.projects.forEach(function (project, i) {
      const a = document.createElement('a');
      a.className = 'work-card ' + colorClass(project.color);
      a.href = project.href;
      a.setAttribute('data-reveal', '');
      a.setAttribute('data-reveal-delay', String(100 * i));
      a.innerHTML =
        '<div class="work-card__img"><img src="' +
        project.image +
        '" alt="' +
        project.title +
        '" loading="lazy"></div><div class="work-card__body"><h3>' +
        project.title +
        '</h3><p class="work-card__tags">' +
        project.tags.join(' · ') +
        '</p></div>';
      grid.appendChild(a);
    });
  }

  function renderTestimonials() {
    const items = site.testimonials.concat(site.testimonials);
    document.getElementById('testimonials-track').innerHTML = items
      .map(function (t) {
        return (
          '<article class="quote-card"><p>“' +
          t.quote +
          '”</p><footer><strong>' +
          t.name +
          '</strong><span>' +
          t.role +
          ' · ' +
          t.company +
          '</span></footer></article>'
        );
      })
      .join('');
  }

  function renderContact() {
    document.getElementById('contact-title').textContent = site.contact.title;
    const email = document.getElementById('contact-email');
    email.textContent = site.contact.email;
    email.href = 'mailto:' + site.contact.email;
    const social = document.getElementById('contact-social');
    social.innerHTML = '';
    site.contact.social.forEach(function (s) {
      const a = document.createElement('a');
      a.href = s.href;
      a.textContent = s.label;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      social.appendChild(a);
    });
    document.getElementById('footer-copy').textContent = site.footer.copyright;
    document.getElementById('footer-credit').textContent = site.footer.credit;
  }

  applyTheme();
  setMeta();
  renderNav();
  renderHero();
  renderTicker();
  renderStatus();
  renderAbout();
  renderServices();
  renderWork();
  renderTestimonials();
  renderContact();
})();
