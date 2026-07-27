import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PWCORE = '/home/client/workspace/tmp/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PWCORE);
const fs = require('fs');
const CHROME = '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const CHOME = '/home/client/workspace/tmp/chrome-home';
fs.mkdirSync(CHOME, { recursive: true }); process.env.HOME = CHOME;

const sites = [
  ['SaaSHub', 'https://www.saashub.com/login'],
  ['Toolify', 'https://www.toolify.ai/signin'],
  ['ToolPilot', 'https://www.toolpilot.ai/'],
];
// свежий контекст без профиля-локера, чтобы не конфликтовать
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
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForTimeout(4000);
    const html = await page.content();
    const info = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input')].map(i => i.type + (i.name?`:${i.name}`:'')).slice(0,12);
      const social = [...document.querySelectorAll('a,button')].map(e=>(e.innerText||'').trim()).filter(t=>/google|github|sign in with|continue with|email/i.test(t)).slice(0,8);
      return { inputs, social: [...new Set(social)] };
    });
    console.log(`\n=== ${name} (${url})`);
    console.log('  status:', resp && resp.status(), '| title:', await page.title());
    console.log('  cloudflare:', /just a moment|security verification|cf-challenge|verifying you are/i.test(html));
    console.log('  captcha:', /recaptcha|hcaptcha|turnstile/i.test(html));
    console.log('  inputs:', JSON.stringify(info.inputs));
    console.log('  social/email:', JSON.stringify(info.social));
    await page.screenshot({ path: `/home/client/projects/Devexthub-site/.shots/probe-${name}.png` });
  } catch (e) { console.log(`\n=== ${name}: ERR ${e.message.split('\n')[0]}`); }
  await ctx.close();
}
await browser.close();
