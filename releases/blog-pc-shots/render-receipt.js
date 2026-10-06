// receipt.html -> receipt.png (тестовая картинка для OCR-прогона)
const { chromium } = require('/home/client/projects/JobAgent/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-breakpad'], env: { ...process.env, HOME: '/home/client/projects/Devexthub-site/.shots/chrome-home-et' } });
  const p = await b.newPage({ deviceScaleFactor: 1 });
  await p.goto('file://' + __dirname + '/receipt.html');
  await (await p.$('#r')).screenshot({ path: __dirname + '/receipt.png' });
  await b.close();
})();
