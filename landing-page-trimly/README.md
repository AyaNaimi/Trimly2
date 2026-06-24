# Landing page (editable, no Framer app)

Clone éditable de **vsk.design** (`framer-export.html`) — mêmes couleurs (tokens Framer), typo, flux (hero multi-lignes, ticker, cartes colorées, work, témoignages), et animations proches (scroll, nav hide, marquees, parallax).

## Edit content (no build, no Framer)

| File | What to change |
|------|----------------|
| [`config/site.config.js`](config/site.config.js) | All copy, links, features, projects, pricing |
| [`config/theme.config.js`](config/theme.config.js) | Colors, fonts, layout tokens |
| [`css/styles.css`](css/styles.css) | Layout, spacing, extra styles |
| [`index.html`](index.html) | Section structure (advanced) |

Save a file and **refresh the browser**.

## Run locally

```bash
npx --yes serve landing-page-trimly -p 3456
```

Open [http://localhost:3456](http://localhost:3456)

## Animations included

- Scroll reveal (`data-reveal` + Intersection Observer)
- Nav hides on scroll down, shows on scroll up
- Infinite marquee ticker
- Hero glow + card shine
- Animated counters (`data-count`)
- GSAP ScrollTrigger parallax & section titles
- 3D tilt on project cards (hover)
- Smooth in-page anchor scroll

Uses [GSAP](https://greensock.com/gsap/) from CDN (free for most sites; check license if commercial).

## Original Framer export

[`framer-export.html`](framer-export.html) is the untouched published export (100% original Framer motion). Use it as a visual reference or fallback. The editable site does not require Framer to run.

## Extract text from the Framer export (optional)

If you need to copy exact strings from the original page (uses an isolated `tools/` folder — not the Expo app root):

```bash
npx --yes serve landing-page-trimly -p 3456
```

In another terminal:

```bash
cd landing-page-trimly/tools
npm install
npx playwright install chromium
node ../../scripts/extract-framer-dom.js http://localhost:3456
```

Output: `config/extracted-content.json` — paste values into `site.config.js`.

If Chromium install fails with a lockfile error, wait a minute or delete `%LOCALAPPDATA%\ms-playwright\__dirlock` and retry.

## Deploy

Upload the whole `landing-page-trimly` folder to any static host (Netlify, Vercel, GitHub Pages, S3). No build step required.
