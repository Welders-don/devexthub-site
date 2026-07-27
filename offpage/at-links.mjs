import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PWCORE = '/home/client/workspace/tmp/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PWCORE);
const fs = require('fs');
const CHROME = '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const PROFILE = '/home/client/projects/Devexthub-site/.browser-profile';
const CHOME = '/home/client/workspace/tmp/chrome-home';
fs.mkdirSync(CHOME, { recursive: true }); process.env.HOME = CHOME;
const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: CHROME, headless: true, viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  chromiumSandbox: false, ignoreDefaultArgs: ['--disable-crashpad'],
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-crashpad'],
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto('https://alternativeto.net/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(2000);
const links = await page.evaluate(() => [...document.querySelectorAll('a')]
  .map(a => ({ t: (a.innerText||'').trim(), href: a.href }))
  .filter(x => /login|sign\s?up|sign\s?in|register|account|join/i.test(x.t + ' ' + x.href)));
console.log(JSON.stringify(links.slice(0, 30), null, 2));
await ctx.close();
