import { chromium } from '/home/client/projects/JobAgent/node_modules/playwright/index.mjs';
const b = await chromium.launch({executablePath:'/home/client/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell'});
const p = await b.newPage({ viewport:{width:1920,height:1080} });
for (const f of ['paste-empty','paste','csv']) {
  await p.goto('file://' + process.cwd() + '/' + f + '.html');
  await p.screenshot({ path: f + '.png' });
}
await b.close(); console.log('shots ok');
