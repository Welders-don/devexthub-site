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
await page.waitForTimeout(2500);
const all = await page.evaluate(() => {
  const hrefs = [...new Set([...document.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(h => h && /login|signup|signin|register|account|user|auth|join/i.test(h)))];
  const btns = [...document.querySelectorAll('button')].map(b => (b.innerText||'').trim()).filter(Boolean);
  const hasSignin = /sign in|log in|sign up/i.test(document.body.innerText);
  return { hrefs: hrefs.slice(0,40), btns: [...new Set(btns)].slice(0,30), hasSignin };
});
console.log(JSON.stringify(all, null, 2));
await page.screenshot({ path: '/home/client/projects/Devexthub-site/.shots/at-home.png' });
await ctx.close();
