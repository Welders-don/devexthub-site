import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PWCORE = '/home/client/workspace/tmp/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PWCORE);
const fs = require('fs');
const CHROME = '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const PROFILE = '/home/client/projects/Devexthub-site/.browser-profile';
const CHOME = '/home/client/workspace/tmp/chrome-home';
fs.mkdirSync(CHOME, { recursive: true });
process.env.HOME = CHOME;

const url = process.argv[2] || 'https://alternativeto.net/account/signup/';
const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: CHROME, headless: true, viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  chromiumSandbox: false,
  ignoreDefaultArgs: ['--disable-crashpad'],
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-crashpad'],
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  console.log('STATUS:', resp && resp.status(), 'URL:', page.url());
  console.log('TITLE:', await page.title());
  const fields = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].map(i => ({ name: i.name, type: i.type, id: i.id, ph: i.placeholder }));
    const btns = [...document.querySelectorAll('button, input[type=submit], a[role=button]')].map(b => (b.innerText || b.value || '').trim()).filter(Boolean);
    const social = [...document.querySelectorAll('a,button')].map(e => (e.innerText||'').trim()).filter(t => /google|github|facebook|apple|microsoft|sign in with|continue with/i.test(t));
    const captcha = /recaptcha|hcaptcha|turnstile|cf-challenge/i.test(document.documentElement.innerHTML);
    return { inputs, btns: [...new Set(btns)].slice(0, 25), social: [...new Set(social)], captcha };
  });
  console.log(JSON.stringify(fields, null, 2));
  await page.screenshot({ path: '/home/client/projects/Devexthub-site/.shots/at-signup.png' });
  console.log('SHOT: .shots/at-signup.png');
} catch (e) { console.log('ERR:', e.message); }
await ctx.close();
