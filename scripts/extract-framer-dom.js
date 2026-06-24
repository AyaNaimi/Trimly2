/**
 * One-time helper: extract text/structure from the Framer export after hydration.
 * Usage: node scripts/extract-framer-dom.js [url]
 */
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'http://localhost:3456';

async function main() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    console.error('Install playwright: npx playwright install chromium');
    process.exit(1);
  }

  const { chromium } = playwright;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(6000);
  const hasMain = await page.$('#main');
  if (!hasMain) throw new Error('Missing #main container');

  const data = await page.evaluate(() => {
    const main = document.querySelector('#main');
    if (!main) return { error: 'no #main' };

    const lines = [];
    const walk = (el, depth) => {
      if (depth > 14) return;
      const tag = el.tagName?.toLowerCase();
      if (!tag || ['script', 'style', 'svg', 'path', 'noscript'].includes(tag)) return;

      const directText = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent.trim())
        .join(' ')
        .trim();

      if (directText && directText.length > 1) {
        lines.push({
          depth,
          tag,
          text: directText.slice(0, 200),
          selector: el.getAttribute('data-framer-name') || el.id || '',
        });
      }

      [...el.children].forEach((child) => walk(child, depth + 1));
    };
    walk(main, 0);

    const links = [...main.querySelectorAll('a[href]')].map((a) => ({
      text: (a.innerText || '').trim().slice(0, 80),
      href: a.getAttribute('href'),
    }));

    const images = [...main.querySelectorAll('img[src]')].map((img) => ({
      alt: img.alt || '',
      src: img.currentSrc || img.src,
    }));

    return { lines: lines.slice(0, 200), links: links.slice(0, 80), images: images.slice(0, 40) };
  });

  const out = path.join(__dirname, '../landing-page-trimly/config/extracted-content.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  console.log('Wrote', out, '- lines:', data.lines?.length || 0);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
