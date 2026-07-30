import pkg from '/home/client/workspace/tmp/pw/node_modules/playwright-core/index.js';
const { chromium } = pkg;
const dir = '/home/client/projects/Devexthub-site/releases/marquee';
const jobs = [
  ['pdf-to-excel.html',   'pdf-to-excel-1400x560.png'],
  ['extract-text.html',   'extract-text-1400x560.png'],
  ['image-enhancer.html', 'image-enhancer-1400x560.png'],
];
const b = await chromium.connectOverCDP('http://127.0.0.1:9223');
const ctx = b.contexts()[0] || await b.newContext();
for (const [src, out] of jobs) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1400, height: 560 });
  await page.goto('file://' + dir + '/' + src);
  await page.waitForTimeout(700);
  await page.screenshot({ path: dir + '/' + out });
  console.log('done ' + out);
  await page.close();
}
process.exit(0);
