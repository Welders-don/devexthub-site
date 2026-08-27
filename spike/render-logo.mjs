/**
 * Рендер бренд-знака Devexthub (вариант B «Y», 3 узла) из SVG в PNG.
 * Крупные размеры — из logo-mark.svg, мелкие (16/32) — из утолщённого logo-mark-small.svg.
 * Рендер через chrome-headless-shell CLI: playwright-core 1208 в этом окружении не стартует
 * (crashpad: --database is required).
 * Запуск: node spike/render-logo.mjs
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CHROME =
  '/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell';

const SIZES = [
  { size: 180, src: 'assets/logo-mark.svg', out: 'assets/logo-mark-180.png' },
  { size: 128, src: 'assets/logo-mark.svg', out: 'assets/logo-mark-128.png' },
  { size: 48, src: 'assets/logo-mark.svg', out: 'assets/logo-mark-48.png' },
  { size: 32, src: 'assets/logo-mark.svg', out: 'assets/logo-mark-32.png' },
  { size: 16, src: 'assets/logo-mark-small.svg', out: 'assets/logo-mark-16.png' },
];

for (const { size, src, out } of SIZES) {
  const svg = readFileSync(src, 'utf8').replace(
    /width="100" height="100"/,
    `width="${size}" height="${size}"`
  );
  const html = `/tmp/logo-render-${size}.html`;
  writeFileSync(html, `<body style="margin:0">${svg}</body>`);
  execFileSync(CHROME, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-breakpad',
    '--hide-scrollbars',
    '--default-background-color=00000000',
    `--window-size=${size},${size}`,
    `--screenshot=${out}`,
    `file://${html}`,
  ]);
  unlinkSync(html);
  console.log(`${out} — ${size}×${size}`);
}
