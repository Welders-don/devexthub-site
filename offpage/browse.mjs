// Драйвер существующего chromium-1208 (Chrome for Testing 145) через playwright-core из npx-кэша.
// Персистентный профиль → куки/сессии площадок сохраняются между запусками.
// Использование: node browse.mjs <goto|shot|eval> <arg>
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PWCORE = '/home/client/workspace/tmp/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PWCORE);

const CHROME = '/home/client/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const PROFILE = '/home/client/projects/Devexthub-site/.browser-profile';
const SHOTS = '/home/client/projects/Devexthub-site/.shots';

const ctx = await chromium.launchPersistentContext(PROFILE, {
  executablePath: CHROME,
  headless: true,
  viewport: { width: 1280, height: 900 },
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  args: ['--no-sandbox', '--disable-crashpad', '--disable-dev-shm-usage'],
});
const page = ctx.pages()[0] || await ctx.newPage();
export { ctx, page, SHOTS };
