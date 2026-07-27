import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PWCORE = '/home/client/workspace/tmp/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PWCORE);
const fs = require('fs');
const CHROME = '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const CHOME = '/home/client/workspace/tmp/chrome-home';
fs.mkdirSync(CHOME, { recursive: true }); process.env.HOME = CHOME;

const sites = [
  ['AIxploria', 'https://www.aixploria.com/en/submit-ai-tool-or-feature-company/'],
  ['OpenAIToolsHub', 'https://www.openaitoolshub.org/submit'],
  ['TheNextAI', 'https://www.thenextai.com/submit-ai-tool/'],
  ['DofollowTools', 'https://dofollow.tools/'],
];
const browser = await chromium.launch({
  executablePath: CHROME, headless: true,
  chromiumSandbox: false, ignoreDefaultArgs: ['--disable-crashpad'],
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-crashpad'],
});
for (const [name, url] of sites) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3500);
    const html = await page.content();
    const txt = await page.evaluate(() => document.body ? document.body.innerText : '');
    const paid = /\$\d|paid|premium|pricing|pay \$|one-?time|per month|\/mo\b/i.test(txt);
    const reciprocal = /link back|backlink to us|mandatory.*link|add our badge|reciprocal/i.test(txt);
    const cf = /just a moment|security verification|verifying you are/i.test(html);
    const captcha = /recaptcha|hcaptcha|turnstile/i.test(html);
    const hasForm = await page.evaluate(() => document.querySelectorAll('form input, form textarea').length);
    console.log(`\n=== ${name}`);
    console.log('  status:', resp && resp.status(), '| title:', (await page.title()).slice(0,60));
    console.log('  cloudflare:', cf, '| captcha:', captcha, '| formFields:', hasForm);
    console.log('  paidMention:', paid, '| reciprocalMention:', reciprocal);
  } catch (e) { console.log(`\n=== ${name}: ERR ${e.message.split('\n')[0]}`); }
  await ctx.close();
}
await browser.close();
